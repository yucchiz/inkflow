import Testing
import Foundation
@testable import InkFlowKit

@Suite("EditorViewModel")
struct EditorViewModelTests {
    // MARK: - loadDocument

    @MainActor
    @Test("loadDocument でドキュメントの内容がセットされること")
    func loadDocumentSetsContent() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(
            id: id,
            title: "テストタイトル",
            body: "テスト本文",
            createdAt: Date(timeIntervalSince1970: 1000),
            updatedAt: Date(timeIntervalSince1970: 2000)
        )
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        #expect(vm.documentId == id)
        #expect(vm.title == "テストタイトル")
        #expect(vm.body == "テスト本文")
        #expect(vm.createdAt == Date(timeIntervalSince1970: 1000))
        #expect(vm.updatedAt == Date(timeIntervalSince1970: 2000))
        #expect(vm.isLoading == false)
    }

    @MainActor
    @Test("loadDocument 後に isLoading が false になること")
    func loadDocumentSetsIsLoadingToFalse() async {
        let repo = MockDocumentRepository()
        let vm = EditorViewModel(repository: repo)

        #expect(vm.isLoading == true)
        await vm.loadDocument(id: UUID())
        #expect(vm.isLoading == false)
    }

    @MainActor
    @Test("loadDocument がエラー時に error を設定すること")
    func loadDocumentSetsErrorOnFailure() async {
        let repo = MockDocumentRepository()
        repo.shouldThrowOnGetById = true

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: UUID())

        #expect(vm.error != nil)
        #expect(vm.isLoading == false)
    }

    @MainActor
    @Test("loadDocument 中に title/body のセットで保存がスケジュールされないこと")
    func loadDocumentDoesNotTriggerSave() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "タイトル", body: "本文")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        // ロード時のセットでは保存がスケジュールされないので、
        // saveCallCount は 0 のまま
        #expect(repo.saveCallCount == 0)
    }

    @MainActor
    @Test("存在しない ID で loadDocument した場合、documentId が nil のままであること")
    func loadDocumentWithNonExistentIdKeepsDocumentIdNil() async {
        let repo = MockDocumentRepository()
        let vm = EditorViewModel(repository: repo)

        await vm.loadDocument(id: UUID())

        #expect(vm.documentId == nil)
        #expect(vm.isLoading == false)
    }

    // MARK: - save

    @MainActor
    @Test("save で saveStatus が saving から saved に遷移すること")
    func saveTransitionsSaveStatus() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "タイトル", body: "本文")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        await vm.save()

        #expect(vm.saveStatus == .saved)
    }

    @MainActor
    @Test("save 後 2秒で saveStatus が idle に戻ること")
    func saveSetsIdleAfterDelay() async throws {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "タイトル", body: "本文")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        await vm.save()
        #expect(vm.saveStatus == .saved)

        // 2秒 + マージンを待つ
        try await Task.sleep(for: .milliseconds(2200))

        #expect(vm.saveStatus == .idle)
    }

    @MainActor
    @Test("save がエラー時に saveStatus を idle に戻すこと")
    func saveSetsIdleOnError() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "タイトル", body: "本文")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        repo.shouldThrowOnSave = true
        await vm.save()

        #expect(vm.saveStatus == .idle)
        #expect(vm.error != nil)
    }

    @MainActor
    @Test("documentId が nil のとき save が何もしないこと")
    func saveDoesNothingWithoutDocumentId() async {
        let repo = MockDocumentRepository()
        let vm = EditorViewModel(repository: repo)

        await vm.save()

        #expect(repo.saveCallCount == 0)
        #expect(vm.saveStatus == .idle)
    }

    // MARK: - デバウンス自動保存

    @MainActor
    @Test("title 変更後に 500ms 以上経つと自動保存されること")
    func titleChangeTriggersAutoSave() async throws {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "", body: "")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        vm.title = "新しいタイトル"

        // デバウンス完了を待つ（500ms + マージン）
        try await Task.sleep(for: .milliseconds(700))

        #expect(repo.saveCallCount >= 1)
    }

    @MainActor
    @Test("body 変更後に 500ms 以上経つと自動保存されること")
    func bodyChangeTriggersAutoSave() async throws {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "", body: "")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        vm.body = "新しい本文"

        // デバウンス完了を待つ
        try await Task.sleep(for: .milliseconds(700))

        #expect(repo.saveCallCount >= 1)
    }

    @MainActor
    @Test("連続した変更ではデバウンスにより保存が1回にまとまること")
    func rapidChangesDebounceToSingleSave() async throws {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "", body: "")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        // 連続して変更
        vm.title = "1"
        try await Task.sleep(for: .milliseconds(100))
        vm.title = "12"
        try await Task.sleep(for: .milliseconds(100))
        vm.title = "123"

        // デバウンス完了を待つ
        try await Task.sleep(for: .milliseconds(700))

        #expect(repo.saveCallCount == 1)
    }

    // MARK: - onDisappear

    @MainActor
    @Test("空ドキュメントの onDisappear で削除されること")
    func onDisappearDeletesEmptyDocument() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "", body: "")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        await vm.onDisappear()

        #expect(repo.removeCallCount == 1)
        #expect(repo.lastRemovedId == id)
    }

    @MainActor
    @Test("空白のみのドキュメントも onDisappear で削除されること")
    func onDisappearDeletesWhitespaceOnlyDocument() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "   ", body: "\n  \t")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        await vm.onDisappear()

        #expect(repo.removeCallCount == 1)
    }

    @MainActor
    @Test("内容のあるドキュメントの onDisappear でフラッシュ保存されること")
    func onDisappearFlushSavesNonEmptyDocument() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "タイトル", body: "本文")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        vm.title = "更新後"

        await vm.onDisappear()

        #expect(repo.saveCallCount >= 1)
    }

    // MARK: - 集中モード

    @MainActor
    @Test("toggleFocusMode で isFocusMode が切り替わること")
    func toggleFocusModeTogglesState() {
        let repo = MockDocumentRepository()
        let vm = EditorViewModel(repository: repo)

        #expect(vm.isFocusMode == false)
        #expect(vm.showControls == true)

        vm.toggleFocusMode()

        #expect(vm.isFocusMode == true)
        #expect(vm.showControls == false)

        vm.toggleFocusMode()

        #expect(vm.isFocusMode == false)
        #expect(vm.showControls == true)
    }

    @MainActor
    @Test("exitFocusMode で集中モードが解除されること")
    func exitFocusModeDisablesFocusMode() {
        let repo = MockDocumentRepository()
        let vm = EditorViewModel(repository: repo)

        vm.toggleFocusMode()
        #expect(vm.isFocusMode == true)

        vm.exitFocusMode()

        #expect(vm.isFocusMode == false)
        #expect(vm.showControls == true)
    }

    // MARK: - characterCount

    @MainActor
    @Test("characterCount が body の文字数を返すこと")
    func characterCountReturnsBodyLength() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "", body: "こんにちは")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        #expect(vm.characterCount == 5)
    }

    @MainActor
    @Test("characterCount が空文字列で 0 を返すこと")
    func characterCountReturnsZeroForEmptyBody() {
        let repo = MockDocumentRepository()
        let vm = EditorViewModel(repository: repo)

        #expect(vm.characterCount == 0)
    }

    // MARK: - deleteDocument

    @MainActor
    @Test("deleteDocument が repository.remove を呼ぶこと")
    func deleteDocumentCallsRepositoryRemove() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "タイトル", body: "本文")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        await vm.deleteDocument()

        #expect(repo.removeCallCount == 1)
        #expect(repo.lastRemovedId == id)
    }

    @MainActor
    @Test("deleteDocument が documentId なしで何もしないこと")
    func deleteDocumentDoesNothingWithoutDocumentId() async {
        let repo = MockDocumentRepository()
        let vm = EditorViewModel(repository: repo)

        await vm.deleteDocument()

        #expect(repo.removeCallCount == 0)
    }

    @MainActor
    @Test("deleteDocument がエラー時に error を設定すること")
    func deleteDocumentSetsErrorOnFailure() async {
        let repo = MockDocumentRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "タイトル", body: "本文")
        repo.documents = [doc]

        let vm = EditorViewModel(repository: repo)
        await vm.loadDocument(id: id)

        repo.shouldThrowOnRemove = true
        await vm.deleteDocument()

        #expect(vm.error != nil)
    }
}
