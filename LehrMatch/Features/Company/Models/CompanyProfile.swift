import Foundation

struct CompanyProfile: Identifiable, Codable {
    let id: UUID
    let authUserId: UUID
    var companyName: String
    var industry: String
    var canton: String
    var city: String
    var postalCode: String?
    var address: String?
    var websiteUrl: String?
    var description: String?
    var logoUrl: String?
    var videoUrl: String?
    var companySize: String?
    var cultureTags: [String]
    var cultureDescription: String?
    var contactPerson: String?
    var contactEmail: String
    var contactPhone: String?
    var verified: Bool
    var premium: Bool
}
