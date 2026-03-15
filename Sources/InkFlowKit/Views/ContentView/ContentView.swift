import SwiftUI
import SwiftData

public struct ContentView: View {
    public init() {}

    public var body: some View {
        DocumentListView()
    }
}

#Preview {
    let container = try! ModelContainer(
        for: InkDocument.self,
        configurations: ModelConfiguration(isStoredInMemoryOnly: true)
    )
    let repository = SwiftDataRepository(modelContext: container.mainContext)

    ContentView()
        .environment(ThemeManager())
        .environment(ToastManager())
        .environment(DocumentListViewModel(repository: repository))
        .modelContainer(container)
}
