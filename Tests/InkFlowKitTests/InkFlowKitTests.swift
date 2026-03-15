import Testing
@testable import InkFlowKit

@Suite("InkFlowKit")
struct InkFlowKitTests {
    @Test("バージョンが定義されていること")
    func version() {
        #expect(InkFlowKit.version == "1.0.0")
    }
}
