import Testing
import Foundation
@testable import InkFlowKit

@Suite("DocumentListViewModel")
struct DocumentListViewModelTests {
    // MARK: - 初期状態

    @MainActor
    @Test("初期状態で isLoading が true であること")
    func initialIsLoadingIsTrue() {
        let repo = MockDocumentRepository()
        let vm = DocumentListViewModel(repository: repo)

        #expect(vm.isLoading == true)
        #expect(vm.documents.isEmpty)
        #expect(vm.error == nil)
    }

    // MARK: - loadDocuments

    @MainActor
    @Test("loadDocuments で documents が設定されること")
    func loadDocumentsSetsDocuments() async {
        let repo = MockDocumentRepository()
        let doc1 = InkDocument(title: "文書1", body: "本文1")
        let doc2 = InkDocument(title: "文書2", body: "本文2")
        repo.documents = [doc1, doc2]

        let vm = DocumentListViewModel(repository: repo)
        await vm.loadDocuments()

        #expect(vm.documents.count == 2)
    }

    @MainActor
    @Test("loadDocuments 後に isLoading が false になること")
    func loadDocumentsSetsIsLoadingToFalse() async {
        let repo = MockDocumentRepository()
        let vm = DocumentListViewModel(repository: repo)

        await vm.loadDocuments()

        #expect(vm.isLoading == false)
    }

    @MainActor
    @Test("loadDocuments がエラー時に error を設定すること")
    func loadDocumentsSetsErrorOnFailure() async {
        let repo = MockDocumentRepository()
        repo.shouldThrowOnGetAll = true

        let vm = DocumentListViewModel(repository: repo)
        await vm.loadDocuments()

        #expect(vm.error != nil)
        #expect(vm.isLoading == false)
    }

    // MARK: - createDocument

    @MainActor
    @Test("createDocument で新しいドキュメントが追加されること")
    func createDocumentAddsDocument() async {
        let repo = MockDocumentRepository()
        let vm = DocumentListViewModel(repository: repo)

        _ = await vm.createDocument()

        #expect(vm.documents.count == 1)
    }

    @MainActor
    @Test("createDocument が UUID を返すこと")
    func createDocumentReturnsUUID() async {
        let repo = MockDocumentRepository()
        let vm = DocumentListViewModel(repository: repo)

        let id = await vm.createDocument()

        #expect(id != nil)
    }

    @MainActor
    @Test("createDocument がドキュメントをリストの先頭に挿入すること")
    func createDocumentInsertsAtBeginning() async {
        let repo = MockDocumentRepository()
        let existingDoc = InkDocument(title: "既存", body: "")
        repo.documents = [existingDoc]

        let vm = DocumentListViewModel(repository: repo)
        await vm.loadDocuments()

        let newId = await vm.createDocument()

        #expect(vm.documents.count == 2)
        #expect(vm.documents[0].id == newId)
    }

    @MainActor
    @Test("createDocument がエラー時に nil を返すこと")
    func createDocumentReturnsNilOnError() async {
        let repo = MockDocumentRepository()
        repo.shouldThrowOnSave = true

        let vm = DocumentListViewModel(repository: repo)
        let id = await vm.createDocument()

        #expect(id == nil)
        #expect(vm.error != nil)
    }

    // MARK: - deleteDocument

    @MainActor
    @Test("deleteDocument でドキュメントが削除されること")
    func deleteDocumentRemovesFromList() async {
        let repo = MockDocumentRepository()
        let doc = InkDocument(title: "削除対象", body: "")
        repo.documents = [doc]

        let vm = DocumentListViewModel(repository: repo)
        await vm.loadDocuments()
        #expect(vm.documents.count == 1)

        await vm.deleteDocument(doc.id)

        #expect(vm.documents.isEmpty)
    }

    @MainActor
    @Test("deleteDocument がリポジトリの remove を呼ぶこと")
    func deleteDocumentCallsRepositoryRemove() async {
        let repo = MockDocumentRepository()
        let doc = InkDocument(title: "対象", body: "")
        repo.documents = [doc]

        let vm = DocumentListViewModel(repository: repo)
        await vm.loadDocuments()

        await vm.deleteDocument(doc.id)

        #expect(repo.removeCallCount == 1)
        #expect(repo.lastRemovedId == doc.id)
    }

    @MainActor
    @Test("deleteDocument がエラー時に error を設定すること")
    func deleteDocumentSetsErrorOnFailure() async {
        let repo = MockDocumentRepository()
        let doc = InkDocument(title: "対象", body: "")
        repo.documents = [doc]

        let vm = DocumentListViewModel(repository: repo)
        await vm.loadDocuments()

        repo.shouldThrowOnRemove = true
        await vm.deleteDocument(doc.id)

        #expect(vm.error != nil)
    }
}
