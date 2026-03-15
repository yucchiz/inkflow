import SwiftUI

public struct ToastMessage: Identifiable, Equatable, Sendable {
    public let id = UUID()
    public let text: String

    public init(text: String) {
        self.text = text
    }
}

public struct ToastView: View {
    let message: ToastMessage
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    public var body: some View {
        Text(message.text)
            .font(Typography.ui())
            .foregroundStyle(Color.InkFlow.bg(for: colorScheme))
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.InkFlow.text(for: colorScheme))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .shadow(radius: 2)
            .accessibilityLabel(message.text)
            .accessibilityAddTraits(.isStaticText)
    }
}

/// トースト表示を管理する環境オブジェクト
@MainActor
@Observable
public final class ToastManager {
    public var currentToast: ToastMessage?
    private var dismissTask: Task<Void, Never>?

    public init() {}

    public func show(_ text: String) {
        dismissTask?.cancel()
        currentToast = ToastMessage(text: text)

        dismissTask = Task {
            try? await Task.sleep(for: .seconds(Constants.toastDuration))
            guard !Task.isCancelled else { return }
            currentToast = nil
        }
    }

    public func dismiss() {
        dismissTask?.cancel()
        currentToast = nil
    }
}

/// ToastManager を使ってオーバーレイ表示するための ViewModifier
public struct ToastOverlayModifier: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let manager: ToastManager

    public func body(content: Content) -> some View {
        content
            .overlay(alignment: .bottom) {
                if let toast = manager.currentToast {
                    ToastView(message: toast)
                        .padding(.bottom, 48)
                        .transition(
                            reduceMotion
                                ? .opacity
                                : .move(edge: .bottom).combined(with: .opacity)
                        )
                        .animation(
                            reduceMotion ? .none : .easeOut(duration: 0.2),
                            value: manager.currentToast
                        )
                }
            }
            .animation(
                reduceMotion ? .none : .easeOut(duration: 0.2),
                value: manager.currentToast
            )
    }
}

extension View {
    public func toastOverlay(manager: ToastManager) -> some View {
        modifier(ToastOverlayModifier(manager: manager))
    }
}

#Preview {
    ToastView(message: ToastMessage(text: "クリップボードにコピーしました"))
        .padding()
}
