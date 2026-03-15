import Testing
import Foundation
@testable import InkFlowKit

@Suite("ExportHelper")
struct ExportHelperTests {
    @Test("タイトルと本文の両方がある場合、改行2つで結合されること")
    func exportTextWithTitleAndBody() {
        let result = ExportHelper.exportText(title: "タイトル", body: "本文テキスト")
        #expect(result == "タイトル\n\n本文テキスト")
    }

    @Test("タイトルが空の場合、本文のみが返されること")
    func exportTextWithEmptyTitle() {
        let result = ExportHelper.exportText(title: "", body: "本文のみ")
        #expect(result == "本文のみ")
    }

    @Test("本文が空の場合、タイトルと空行が返されること")
    func exportTextWithEmptyBody() {
        let result = ExportHelper.exportText(title: "タイトル", body: "")
        #expect(result == "タイトル\n\n")
    }

    @Test("両方空の場合、空文字列が返されること")
    func exportTextBothEmpty() {
        let result = ExportHelper.exportText(title: "", body: "")
        #expect(result == "")
    }

    @Test("複数行の本文が正しく結合されること")
    func exportTextWithMultilineBody() {
        let body = "1行目\n2行目\n3行目"
        let result = ExportHelper.exportText(title: "タイトル", body: body)
        #expect(result == "タイトル\n\n1行目\n2行目\n3行目")
    }
}
