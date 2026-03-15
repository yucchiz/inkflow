import Foundation

public enum Constants {
    /// タイトルの最大文字数
    public static let maxTitleLength = 200

    /// 自動保存のデバウンス間隔（ミリ秒）
    public static let autoSaveDebounceMs: UInt64 = 500

    /// 保存完了ステータスの表示時間（秒）
    public static let savedStatusDuration: TimeInterval = 2.0

    /// トースト自動消滅時間（秒）
    public static let toastDuration: TimeInterval = 3.0

    /// 集中モードのコントロール表示トリガー領域（pt）
    public static let focusModeTopThreshold: CGFloat = 60.0
}
