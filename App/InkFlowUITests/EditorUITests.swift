import XCTest

final class EditorUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    private func createAndOpenDocument() {
        let fab = app.buttons["新規ドキュメントを作成"]
        XCTAssertTrue(fab.waitForExistence(timeout: 5))
        fab.tap()
    }

    func testTitleInput() throws {
        createAndOpenDocument()

        let titleField = app.textFields["タイトル"]
        XCTAssertTrue(titleField.waitForExistence(timeout: 5))
        titleField.tap()
        titleField.typeText("テストタイトル")

        XCTAssertEqual(titleField.value as? String, "テストタイトル")
    }

    func testBodyInput() throws {
        createAndOpenDocument()

        let bodyEditor = app.textViews["本文"]
        XCTAssertTrue(bodyEditor.waitForExistence(timeout: 5))
        bodyEditor.tap()
        bodyEditor.typeText("テスト本文")
    }

    func testCharacterCount() throws {
        createAndOpenDocument()

        // ステータスバーに文字数が表示されること
        let statusBar = app.staticTexts.matching(NSPredicate(format: "label CONTAINS '文字'"))
        XCTAssertTrue(statusBar.firstMatch.waitForExistence(timeout: 5))
    }

    func testMenuButton() throws {
        createAndOpenDocument()

        let menuButton = app.buttons["メニュー"]
        XCTAssertTrue(menuButton.waitForExistence(timeout: 5))
        menuButton.tap()

        // メニュー内の項目が表示されること
        let copyButton = app.buttons["コピー"]
        XCTAssertTrue(copyButton.waitForExistence(timeout: 3))
    }
}
