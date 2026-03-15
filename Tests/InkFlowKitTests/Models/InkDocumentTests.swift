import Testing
import Foundation
@testable import InkFlowKit

@Suite("InkDocument")
struct InkDocumentTests {
    @Test("デフォルト値でインスタンス生成できること")
    func initWithDefaults() {
        let doc = InkDocument()

        #expect(doc.title == "")
        #expect(doc.body == "")
    }

    @Test("title, body が空文字列で初期化されること")
    func emptyStrings() {
        let doc = InkDocument()

        #expect(doc.title.isEmpty)
        #expect(doc.body.isEmpty)
    }

    @Test("createdAt, updatedAt が設定されること")
    func timestampsAreSet() {
        let before = Date.now
        let doc = InkDocument()
        let after = Date.now

        #expect(doc.createdAt >= before)
        #expect(doc.createdAt <= after)
        #expect(doc.updatedAt >= before)
        #expect(doc.updatedAt <= after)
    }

    @Test("カスタム値で初期化できること")
    func initWithCustomValues() {
        let id = UUID()
        let title = "テストタイトル"
        let body = "テスト本文"
        let created = Date(timeIntervalSince1970: 1_000_000)
        let updated = Date(timeIntervalSince1970: 2_000_000)

        let doc = InkDocument(
            id: id,
            title: title,
            body: body,
            createdAt: created,
            updatedAt: updated
        )

        #expect(doc.id == id)
        #expect(doc.title == title)
        #expect(doc.body == body)
        #expect(doc.createdAt == created)
        #expect(doc.updatedAt == updated)
    }

    @Test("IDがUUID型であること")
    func idIsUUID() {
        let doc = InkDocument()
        // UUID型であることを型システムで保証（コンパイルが通ること自体がテスト）
        let _: UUID = doc.id
        #expect(doc.id.uuidString.isEmpty == false)
    }
}
