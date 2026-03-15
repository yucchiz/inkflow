import Foundation

@MainActor
@Observable
public final class EditorViewModel {
    private let repository: DocumentRepository

    // ドキュメント状態
    public private(set) var documentId: UUID?
    public var title: String = "" {
        didSet { scheduleSave() }
    }
    public var body: String = "" {
        didSet { scheduleSave() }
    }
    public var createdAt: Date = .now
    public var updatedAt: Date = .now

    // 保存状態
    public var saveStatus: SaveStatus = .idle
    private var saveTask: Task<Void, Never>?
    private var savedStatusTask: Task<Void, Never>?

    // 集中モード
    public var isFocusMode = false
    public var showControls = true

    // ローディング
    public var isLoading = true
    public var error: Error?

    /// 文字数カウント
    public var characterCount: Int { body.count }

    public init(repository: DocumentRepository) {
        self.repository = repository
    }

    /// ドキュメントを読み込む
    public func loadDocument(id: UUID) async {
        isLoading = true
        do {
            if let doc = try await repository.getById(id) {
                documentId = doc.id
                title = doc.title
                body = doc.body
                createdAt = doc.createdAt
                updatedAt = doc.updatedAt
            }
            isLoading = false
        } catch {
            print("[EditorViewModel] ドキュメント読み込みに失敗:", id, error)
            self.error = error
            isLoading = false
        }
    }

    /// 500ms デバウンスで自動保存をスケジュール
    private func scheduleSave() {
        guard !isLoading else { return }

        saveTask?.cancel()
        saveTask = Task {
            try? await Task.sleep(for: .milliseconds(Constants.autoSaveDebounceMs))
            guard !Task.isCancelled else { return }
            await save()
        }
    }

    /// 保存実行
    public func save() async {
        guard let id = documentId else { return }

        saveStatus = .saving
        let now = Date.now
        let doc = InkDocument(
            id: id,
            title: title,
            body: body,
            createdAt: createdAt,
            updatedAt: now
        )

        do {
            try await repository.save(doc)
            updatedAt = now
            saveStatus = .saved

            // 2秒後に idle に戻す
            savedStatusTask?.cancel()
            savedStatusTask = Task {
                try? await Task.sleep(for: .seconds(Constants.savedStatusDuration))
                guard !Task.isCancelled else { return }
                saveStatus = .idle
            }
        } catch {
            print("[EditorViewModel] ドキュメント保存に失敗:", id, error)
            self.error = error
            saveStatus = .idle
        }
    }

    /// 画面離脱時の処理
    public func onDisappear() async {
        // pending の保存タスクをキャンセル
        saveTask?.cancel()
        savedStatusTask?.cancel()

        guard let id = documentId else { return }

        // 空ドキュメントなら削除
        if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
            body.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        {
            do {
                try await repository.remove(id)
            } catch {
                print("[EditorViewModel] 空ドキュメント削除に失敗:", id, error)
            }
        } else {
            // pending があれば即座にフラッシュ保存
            await save()
        }
    }

    /// 集中モードのトグル
    public func toggleFocusMode() {
        isFocusMode.toggle()
        showControls = !isFocusMode
    }

    /// 集中モードを解除
    public func exitFocusMode() {
        isFocusMode = false
        showControls = true
    }

    /// ドキュメントを削除
    public func deleteDocument() async {
        guard let id = documentId else { return }
        do {
            try await repository.remove(id)
        } catch {
            print("[EditorViewModel] ドキュメント削除に失敗:", id, error)
            self.error = error
        }
    }
}
