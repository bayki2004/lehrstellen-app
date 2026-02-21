import Foundation

/// Social/web link on a company profile. Matches Prisma CompanyLinkDTO.
struct CompanyLink: Codable, Identifiable {
    let id: String
    let label: String
    let url: String
    let sortOrder: Int
}
