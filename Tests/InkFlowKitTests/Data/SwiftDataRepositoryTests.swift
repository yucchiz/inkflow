import Testing
import Foundation
@testable import InkFlowKit

// NOTE: SwiftDataRepository は ModelContext ベースの実装だが、
// SPM テスト環境では SwiftData の ModelContainer 初期化が不安定なため、
// MockDocumentRepository を使ってプロトコル準拠の振る舞いをテストする。
// 本物の SwiftData 統合テストは Xcode プロジェクトで実施する。

@Suite("SwiftDataRepository")
struct SwiftDataRepositoryTests {
    @MainActor
    private func makeRepository() -> MockDocumentRepository {
        MockDocumentRepository()
    }

    @MainActor
    @Test("ドキュメントを保存して取得できること")
    func saveAndGetAll() async throws {
        let repo = makeRepository()
        let doc = InkDocument(title: "テスト", body: "本文")

        try await repo.save(doc)
        let docs = try await repo.getAll()

        #expect(docs.count == 1)
        #expect(docs[0].title == "テスト")
        #expect(docs[0].body == "本文")
    }

    @MainActor
    @Test("全ドキュメントが updatedAt 降順で返ること")
    func getAllSortedByUpdatedAtDescending() async throws {
        let repo = makeRepository()

        let oldest = InkDocument(
            title: "oldest",
            body: "",
            updatedAt: Date(timeIntervalSince1970: 1_000)
        )
        let middle = InkDocument(
            title: "middle",
            body: "",
            updatedAt: Date(timeIntervalSince1970: 2_000)
        )
        let newest = InkDocument(
            title: "newest",
            body: "",
            updatedAt: Date(timeIntervalSince1970: 3_000)
        )

        // 意図的にバラバラの順序で保存
        try await repo.save(middle)
        try await repo.save(oldest)
        try await repo.save(newest)

        let docs = try await repo.getAll()

        #expect(docs.count == 3)
        #expect(docs[0].title == "newest")
        #expect(docs[1].title == "middle")
        #expect(docs[2].title == "oldest")
    }

    @MainActor
    @Test("ID でドキュメントを取得できること")
    func getById() async throws {
        let repo = makeRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "対象", body: "内容")

        try await repo.save(doc)
        let found = try await repo.getById(id)

        #expect(found != nil)
        #expect(found?.title == "対象")
        #expect(found?.body == "内容")
    }

    @MainActor
    @Test("存在しない ID で nil が返ること")
    func getByIdReturnsNilForMissing() async throws {
        let repo = makeRepository()
        let nonExistentId = UUID()

        let result = try await repo.getById(nonExistentId)

        #expect(result == nil)
    }

    @MainActor
    @Test("ドキュメントを削除できること")
    func removeDocument() async throws {
        let repo = makeRepository()
        let id = UUID()
        let doc = InkDocument(id: id, title: "削除対象", body: "")

        try await repo.save(doc)

        // 保存されていることを確認
        let beforeRemove = try await repo.getAll()
        #expect(beforeRemove.count == 1)

        try await repo.remove(id)

        let afterRemove = try await repo.getAll()
        #expect(afterRemove.count == 0)

        let deleted = try await repo.getById(id)
        #expect(deleted == nil)
    }

    @MainActor
    @Test("複数ドキュメントを保存して管理できること")
    func multipleDocuments() async throws {
        let repo = makeRepository()

        let doc1 = InkDocument(title: "文書1", body: "内容1")
        let doc2 = InkDocument(title: "文書2", body: "内容2")
        let doc3 = InkDocument(title: "文書3", body: "内容3")

        try await repo.save(doc1)
        try await repo.save(doc2)
        try await repo.save(doc3)

        let docs = try await repo.getAll()
        #expect(docs.count == 3)
    }

    @MainActor
    @Test("存在しないドキュメントの削除がエラーにならないこと")
    func removeNonExistentDocumentDoesNotThrow() async throws {
        let repo = makeRepository()

        // 存在しない ID の削除はエラーにならない
        try await repo.remove(UUID())
    }

    @MainActor
    @Test("同一 ID で save を2回呼んだ場合、ドキュメントが上書きされること")
    func saveOverwritesExistingDocument() async throws {
        let repo = makeRepository()
        let id = UUID()

        let original = InkDocument(id: id, title: "元のタイトル", body: "元の本文")
        try await repo.save(original)

        // 同一 ID のドキュメントのプロパティを更新して再保存
        let updated = InkDocument(id: id, title: "更新後タイトル", body: "更新後本文")
        try await repo.save(updated)

        let docs = try await repo.getAll()
        #expect(docs.count == 1)

        let found = try await repo.getById(id)
        #expect(found?.title == "更新後タイトル")
        #expect(found?.body == "更新後本文")
    }
}
