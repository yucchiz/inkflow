import Foundation
#if canImport(UIKit)
import UIKit
#endif
#if canImport(AppKit)
import AppKit
#endif

public enum ExportHelper {
    /// クリップボードにテキストをコピー
    public static func copyToClipboard(_ text: String) {
        #if os(iOS)
        UIPasteboard.general.string = text
        #elseif os(macOS)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
        #endif
    }

    /// エクスポート用のテキストを生成（タイトル + 本文）
    public static func exportText(title: String, body: String) -> String {
        if title.isEmpty {
            return body
        }
        return "\(title)\n\n\(body)"
    }
}
