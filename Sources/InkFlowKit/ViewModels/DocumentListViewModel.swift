import Foundation

@MainActor
@Observable
public final class DocumentListViewModel {
    private let repository: DocumentRepository

    public var documents: [InkDocument] = []
    public var isLoading = true
    public var error: Error?

    public init(repository: DocumentRepository) {
        self.repository = repository
    }

    /// 全ドキュメントをロード（updatedAt 降順）
    public func loadDocuments() async {
        isLoading = true
        do {
            documents = try await repository.getAll()
            isLoading = false
        } catch {
            print("[DocumentListViewModel] ドキュメント一覧取得に失敗:", error)
            self.error = error
            isLoading = false
        }
    }

    /// 新規ドキュメントを作成し、その ID を返す
    public func createDocument() async -> UUID? {
        let doc = DocumentFactory.create()
        do {
            try await repository.save(doc)
            documents.insert(doc, at: 0)
            return doc.id
        } catch {
            print("[DocumentListViewModel] ドキュメント作成に失敗:", error)
            self.error = error
            return nil
        }
    }

    /// 指定 ID のドキュメントを削除
    public func deleteDocument(_ id: UUID) async {
        do {
            try await repository.remove(id)
            documents.removeAll { $0.id == id }
        } catch {
            print("[DocumentListViewModel] ドキュメント削除に失敗:", id, error)
            self.error = error
        }
    }
}
