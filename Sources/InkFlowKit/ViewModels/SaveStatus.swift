import Foundation

/// 保存状態を表す列挙型。
/// DocumentListViewModel と EditorViewModel の両方から使用する。
public enum SaveStatus: Sendable {
    case idle
    case saving
    case saved
}
