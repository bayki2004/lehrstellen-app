import Foundation

/// Photo in a company's gallery. Matches Prisma CompanyPhotoDTO.
struct CompanyPhoto: Codable, Identifiable {
    let id: String
    let url: String
    let caption: String?
    let sortOrder: Int
}
