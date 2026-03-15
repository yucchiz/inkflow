import Testing
import Foundation
@testable import InkFlowKit

@Suite("Constants")
struct ConstantsTests {
    @Test("タイトル最大文字数が200であること")
    func maxTitleLength() {
        #expect(Constants.maxTitleLength == 200)
    }

    @Test("自動保存デバウンスが500msであること")
    func autoSaveDebounce() {
        #expect(Constants.autoSaveDebounceMs == 500)
    }

    @Test("保存完了ステータス表示時間が2秒であること")
    func savedStatusDuration() {
        #expect(Constants.savedStatusDuration == 2.0)
    }

    @Test("トースト自動消滅時間が3秒であること")
    func toastDuration() {
        #expect(Constants.toastDuration == 3.0)
    }

    @Test("集中モードのトリガー領域が60ptであること")
    func focusModeThreshold() {
        #expect(Constants.focusModeTopThreshold == 60.0)
    }
}
