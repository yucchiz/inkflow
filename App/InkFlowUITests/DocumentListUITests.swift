import XCTest

final class DocumentListUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    func testEmptyStateIsDisplayed() throws {
        // 初回起動時に空状態メッセージが表示されること
        let emptyText = app.staticTexts["まだドキュメントがありません"]
        XCTAssertTrue(emptyText.waitForExistence(timeout: 5))
    }

    func testCreateNewDocument() throws {
        // FABタップで新規ドキュメントを作成し、エディタに遷移
        let fab = app.buttons["新規ドキュメントを作成"]
        XCTAssertTrue(fab.waitForExistence(timeout: 5))
        fab.tap()

        // エディタ画面のタイトル入力欄が表示されること
        let titleField = app.textFields["タイトル"]
        XCTAssertTrue(titleField.waitForExistence(timeout: 5))
    }

    func testNavigateBackFromEditor() throws {
        // ドキュメント作成 → 戻る → 一覧に戻ること
        let fab = app.buttons["新規ドキュメントを作成"]
        XCTAssertTrue(fab.waitForExistence(timeout: 5))
        fab.tap()

        let backButton = app.buttons["戻る"]
        XCTAssertTrue(backButton.waitForExistence(timeout: 5))
        backButton.tap()

        // 一覧画面に戻る（FABが再表示）
        XCTAssertTrue(fab.waitForExistence(timeout: 5))
    }
}
