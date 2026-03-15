import SwiftUI

public struct StatusBarView: View {
    let characterCount: Int
    let saveStatus: SaveStatus
    @Environment(\.colorScheme) private var colorScheme

    public init(characterCount: Int, saveStatus: SaveStatus) {
        self.characterCount = characterCount
        self.saveStatus = saveStatus
    }

    public var body: some View {
        HStack {
            Text("\(characterCount)文字")
                .font(Typography.caption())
                .foregroundStyle(Color.InkFlow.textSub(for: colorScheme))

            Spacer()

            Text(saveStatusText)
                .font(Typography.caption())
                .foregroundStyle(Color.InkFlow.textSub(for: colorScheme))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(characterCount)文字、\(saveStatusText)")
    }

    private var saveStatusText: String {
        switch saveStatus {
        case .idle: return ""
        case .saving: return "保存中..."
        case .saved: return "保存しました"
        }
    }
}

#Preview {
    StatusBarView(characterCount: 1234, saveStatus: .saved)
}
