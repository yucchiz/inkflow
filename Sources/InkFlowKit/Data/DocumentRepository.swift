import Foundation

/// ドキュメントの永続化操作を定義するプロトコル。
/// Web版の `DocumentRepository` インターフェースと同一設計。
@MainActor
public protocol DocumentRepository {
    /// 全ドキュメントを updatedAt 降順で取得する。
    func getAll() async throws -> [InkDocument]

    /// 指定 ID のドキュメントを取得する。存在しなければ nil を返す。
    func getById(_ id: UUID) async throws -> InkDocument?

    /// ドキュメントを保存する。
    func save(_ document: InkDocument) async throws

    /// 指定 ID のドキュメントを削除する。存在しない場合はエラーにならない。
    func remove(_ id: UUID) async throws
}
