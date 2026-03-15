import Foundation
import SwiftData

/// DocumentRepository の SwiftData 実装。
/// ModelContext を通じてドキュメントを永続化する。
@MainActor
public final class SwiftDataRepository: DocumentRepository {
    private let modelContext: ModelContext

    public init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }

    public func getAll() async throws -> [InkDocument] {
        let descriptor = FetchDescriptor<InkDocument>(
            sortBy: [SortDescriptor(\.updatedAt, order: .reverse)]
        )
        return try modelContext.fetch(descriptor)
    }

    public func getById(_ id: UUID) async throws -> InkDocument? {
        let descriptor = FetchDescriptor<InkDocument>(
            predicate: #Predicate { $0.id == id }
        )
        return try modelContext.fetch(descriptor).first
    }

    public func save(_ document: InkDocument) async throws {
        let existing = try await getById(document.id)
        if existing == nil {
            modelContext.insert(document)
        }
        try modelContext.save()
    }

    public func remove(_ id: UUID) async throws {
        if let document = try await getById(id) {
            modelContext.delete(document)
            try modelContext.save()
        }
    }
}
