import SwiftUI
import SwiftData

public struct EditorView: View {
    let documentId: UUID
    private let injectedRepository: DocumentRepository?

    @State private var viewModel: EditorViewModel?
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.modelContext) private var modelContext
    @FocusState private var isBodyFocused: Bool

    @State private var showDeleteConfirm = false

    public init(documentId: UUID, repository: DocumentRepository? = nil) {
        self.documentId = documentId
        self.injectedRepository = repository
    }

    public var body: some View {
        ZStack {
            Color.InkFlow.bg(for: colorScheme)
                .ignoresSafeArea()

            if let viewModel {
                if viewModel.isLoading {
                    ProgressView()
                        .accessibilityLabel("読み込み中")
                } else {
                    editorContent(viewModel: viewModel)
                }
            } else {
                ProgressView()
                    .accessibilityLabel("読み込み中")
            }
        }
        // C1: 集中モード — 上端タップで復帰
        .overlay(alignment: .top) {
            if let viewModel, viewModel.isFocusMode && !viewModel.showControls {
                Color.clear
                    .frame(height: Constants.focusModeTopThreshold)
                    .contentShape(Rectangle())
                    .onTapGesture {
                        viewModel.showControls = true
                    }
                    .accessibilityLabel("コントロールを表示")
                    .accessibilityHint("タップしてヘッダーとステータスバーを表示")
            }
        }
        .navigationBarBackButtonHidden(true)
        #if os(iOS)
        .toolbar(viewModel?.isFocusMode == true ? .hidden : .visible, for: .navigationBar)
        .statusBarHidden(viewModel?.isFocusMode == true)
        #endif
        // C1: 集中モード — Escape キーで解除
        .onKeyPress(.escape) {
            if let viewModel, viewModel.isFocusMode {
                viewModel.exitFocusMode()
                return .handled
            }
            return .ignored
        }
        .confirmDialog(
            isPresented: $showDeleteConfirm,
            title: "ドキュメントの削除",
            message: "このドキュメントを削除しますか？この操作は取り消せません。",
            onConfirm: {
                Task {
                    await viewModel?.deleteDocument()
                    dismiss()
                }
            }
        )
        .task {
            let repository = injectedRepository ?? SwiftDataRepository(modelContext: modelContext)
            let vm = EditorViewModel(repository: repository)
            self.viewModel = vm
            await vm.loadDocument(id: documentId)
            isBodyFocused = true
        }
        .onDisappear {
            Task {
                await viewModel?.onDisappear()
            }
        }
    }

    private func editorContent(viewModel: EditorViewModel) -> some View {
        VStack(spacing: 0) {
            if viewModel.showControls {
                EditorHeaderView(
                    title: viewModel.title,
                    bodyText: viewModel.body,
                    isFocusMode: viewModel.isFocusMode,
                    onBack: { dismiss() },
                    onCopy: {
                        ExportHelper.copyToClipboard(
                            ExportHelper.exportText(title: viewModel.title, body: viewModel.body)
                        )
                    },
                    onToggleFocusMode: {
                        viewModel.toggleFocusMode()
                    },
                    onDelete: {
                        showDeleteConfirm = true
                    }
                )
                .transition(
                    reduceMotion
                        ? .opacity
                        : .move(edge: .top).combined(with: .opacity)
                )
            }

            TitleInputView(title: Binding(
                get: { viewModel.title },
                set: { viewModel.title = $0 }
            ))
            .padding(.horizontal, 16)
            .padding(.top, 8)

            BodyTextEditor(
                text: Binding(
                    get: { viewModel.body },
                    set: { viewModel.body = $0 }
                ),
                isFocused: $isBodyFocused
            )
            .padding(.horizontal, 12)

            if viewModel.showControls {
                StatusBarView(
                    characterCount: viewModel.characterCount,
                    saveStatus: viewModel.saveStatus
                )
                .transition(
                    reduceMotion
                        ? .opacity
                        : .move(edge: .bottom).combined(with: .opacity)
                )
            }
        }
        .animation(
            reduceMotion ? .none : .easeOut(duration: 0.2),
            value: viewModel.showControls
        )
    }
}

#Preview {
    NavigationStack {
        EditorView(documentId: UUID())
    }
    .modelContainer(for: InkDocument.self, inMemory: true)
    .environment(ThemeManager())
}
