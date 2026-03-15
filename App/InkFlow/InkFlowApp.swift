import SwiftUI
import SwiftData
import InkFlowKit

@main
struct InkFlowApp: App {
    let modelContainer: ModelContainer

    @State private var themeManager = ThemeManager()
    @State private var toastManager = ToastManager()
    @State private var viewModel: DocumentListViewModel

    init() {
        do {
            modelContainer = try ModelContainer(for: InkDocument.self)
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
        let repository = SwiftDataRepository(modelContext: modelContainer.mainContext)
        _viewModel = State(initialValue: DocumentListViewModel(repository: repository))
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(themeManager)
                .environment(toastManager)
                .environment(viewModel)
                .preferredColorScheme(themeManager.resolvedColorScheme)
                .toastOverlay(manager: toastManager)
        }
        .modelContainer(modelContainer)
        #if os(macOS)
        .defaultSize(width: 800, height: 600)
        #endif
    }
}
