import Foundation
import SwiftData

/// InkFlow のドキュメントモデル。
/// SwiftData で永続化される。
@Model
public final class InkDocument {
    @Attribute(.unique) public var id: UUID
    public var title: String
    public var body: String
    public var createdAt: Date
    public var updatedAt: Date

    public init(
        id: UUID = UUID(),
        title: String = "",
        body: String = "",
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.body = body
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}
