import Foundation

public enum DocumentFactory {
    public static func create(
        title: String = "",
        body: String = ""
    ) -> InkDocument {
        InkDocument(
            id: UUID(),
            title: title,
            body: body,
            createdAt: .now,
            updatedAt: .now
        )
    }
}
