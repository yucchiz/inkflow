import SwiftUI

public struct DocumentListView: View {
    @Environment(DocumentListViewModel.self) private var viewModel
    @Environment(\.colorScheme) private var colorScheme
    @State private var showDeleteConfirm = false
    @State private var documentToDelete: UUID?
    @State private var navigationPath = NavigationPath()

    public init() {}

    public var body: some View {
        NavigationStack(path: $navigationPath) {
            ZStack {
                Color.InkFlow.bg(for: colorScheme)
                    .ignoresSafeArea()

                if viewModel.isLoading {
                    ProgressView()
                        .accessibilityLabel("読み込み中")
                } else if viewModel.documents.isEmpty {
                    EmptyStateView()
                } else {
                    documentList
                }

                // FAB — 右下に固定配置
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        FABButton(action: createDocument)
                            .padding(24)
                    }
                }
            }
            .navigationTitle("InkFlow")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    ThemeToggleButton()
                }
                #if os(macOS)
                ToolbarItem(placement: .automatic) {
                    Button(action: createDocument) {
                        Label("新規ドキュメント", systemImage: "plus")
                    }
                    .keyboardShortcut("n", modifiers: .command)
                }
                #endif
            }
            .navigationDestination(for: UUID.self) { id in
                EditorView(documentId: id)
            }
            .confirmDialog(
                isPresented: $showDeleteConfirm,
                title: "ドキュメントの削除",
                message: "このドキュメントを削除しますか？この操作は取り消せません。",
                onConfirm: {
                    if let id = documentToDelete {
                        Task { await viewModel.deleteDocument(id) }
                    }
                }
            )
            .task {
                await viewModel.loadDocuments()
            }
        }
    }

    private func createDocument() {
        Task {
            if let id = await viewModel.createDocument() {
                navigationPath.append(id)
            }
        }
    }

    private var documentList: some View {
        List {
            ForEach(viewModel.documents) { doc in
                NavigationLink(value: doc.id) {
                    DocumentCardView(document: doc)
                }
                .listRowBackground(Color.InkFlow.bg(for: colorScheme))
                .listRowSeparator(.hidden)
                .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                .contextMenu {
                    Button(role: .destructive) {
                        documentToDelete = doc.id
                        showDeleteConfirm = true
                    } label: {
                        Label("削除", systemImage: "trash")
                    }
                }
                .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                    Button(role: .destructive) {
                        documentToDelete = doc.id
                        showDeleteConfirm = true
                    } label: {
                        Label("削除", systemImage: "trash")
                    }
                }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }
}

// MARK: - Preview

/// プレビュー用のインメモリリポジトリ
private final class PreviewDocumentRepository: DocumentRepository {
    private var documents: [InkDocument]

    init(documents: [InkDocument] = []) {
        self.documents = documents
    }

    func getAll() async throws -> [InkDocument] {
        documents
    }

    func getById(_ id: UUID) async throws -> InkDocument? {
        documents.first { $0.id == id }
    }

    func save(_ document: InkDocument) async throws {
        documents.append(document)
    }

    func remove(_ id: UUID) async throws {
        documents.removeAll { $0.id == id }
    }
}

#Preview("ドキュメント一覧") {
    let sampleDocs = [
        InkDocument(
            title: "SwiftUI メモ",
            body: "Dynamic Type に対応するために TextStyle ベースのフォントを使用する。",
            createdAt: .now,
            updatedAt: .now
        ),
        InkDocument(
            title: "買い物リスト",
            body: "牛乳、卵、パン",
            createdAt: .now.addingTimeInterval(-86400),
            updatedAt: .now.addingTimeInterval(-3600)
        ),
    ]
    let viewModel = DocumentListViewModel(
        repository: PreviewDocumentRepository(documents: sampleDocs)
    )
    viewModel.isLoading = false
    viewModel.documents = sampleDocs

    return DocumentListView()
        .environment(viewModel)
        .environment(ThemeManager())
}

#Preview("空の一覧") {
    let viewModel = DocumentListViewModel(
        repository: PreviewDocumentRepository()
    )
    viewModel.isLoading = false
    viewModel.documents = []

    return DocumentListView()
        .environment(viewModel)
        .environment(ThemeManager())
}
