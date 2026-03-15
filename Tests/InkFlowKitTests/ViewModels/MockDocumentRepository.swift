import Foundation
@testable import InkFlowKit

@MainActor
final class MockDocumentRepository: DocumentRepository {
    var documents: [InkDocument] = []
    var saveCallCount = 0
    var removeCallCount = 0
    var lastRemovedId: UUID?
    var shouldThrowOnSave = false
    var shouldThrowOnGetAll = false
    var shouldThrowOnGetById = false
    var shouldThrowOnRemove = false

    func getAll() throws -> [InkDocument] {
        if shouldThrowOnGetAll {
            throw MockError.intentional
        }
        return documents.sorted { $0.updatedAt > $1.updatedAt }
    }

    func getById(_ id: UUID) throws -> InkDocument? {
        if shouldThrowOnGetById {
            throw MockError.intentional
        }
        return documents.first { $0.id == id }
    }

    func save(_ document: InkDocument) throws {
        if shouldThrowOnSave {
            throw MockError.intentional
        }
        saveCallCount += 1
        if let index = documents.firstIndex(where: { $0.id == document.id }) {
            documents[index] = document
        } else {
            documents.append(document)
        }
    }

    func remove(_ id: UUID) throws {
        if shouldThrowOnRemove {
            throw MockError.intentional
        }
        removeCallCount += 1
        lastRemovedId = id
        documents.removeAll { $0.id == id }
    }

    enum MockError: Error {
        case intentional
    }
}
