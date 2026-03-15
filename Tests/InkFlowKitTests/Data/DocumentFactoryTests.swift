import Testing
import Foundation
@testable import InkFlowKit

@Suite("DocumentFactory")
struct DocumentFactoryTests {
    @Test("デフォルトで空ドキュメントが生成されること")
    func createDefault() {
        let doc = DocumentFactory.create()

        #expect(doc.title == "")
        #expect(doc.body == "")
        #expect(doc.id.uuidString.isEmpty == false)
    }

    @Test("タイトル・本文を指定して生成できること")
    func createWithValues() {
        let doc = DocumentFactory.create(title: "タイトル", body: "本文テキスト")

        #expect(doc.title == "タイトル")
        #expect(doc.body == "本文テキスト")
    }

    @Test("生成されるドキュメントの ID がユニークであること")
    func uniqueIds() {
        let doc1 = DocumentFactory.create()
        let doc2 = DocumentFactory.create()
        let doc3 = DocumentFactory.create()

        #expect(doc1.id != doc2.id)
        #expect(doc2.id != doc3.id)
        #expect(doc1.id != doc3.id)
    }

    @Test("生成時のタイムスタンプが現在時刻付近であること")
    func timestampsAreNow() {
        let before = Date.now
        let doc = DocumentFactory.create()
        let after = Date.now

        #expect(doc.createdAt >= before)
        #expect(doc.createdAt <= after)
        #expect(doc.updatedAt >= before)
        #expect(doc.updatedAt <= after)
    }
}
