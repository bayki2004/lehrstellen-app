import Foundation

/// Company profile model matching Prisma CompanyProfileDTO.
/// Extended from original Supabase model to include photos, links, and listings.
struct CompanyProfile: Codable, Identifiable {
    let id: String
    let companyName: String
    let description: String
    let industry: String
    let companySize: String
    let website: String?
    let logoUrl: String?
    let videoUrl: String?
    let canton: String
    let city: String
    let address: String?
    let contactPersonName: String
    let contactPersonRole: String?
    let isVerified: Bool
    let listingsCount: Int?
    let photos: [CompanyPhoto]
    let links: [CompanyLink]
    let listings: [CompanyListing]?
}

/// Request body for updating a company profile.
struct UpdateCompanyProfileRequest: Encodable {
    var companyName: String?
    var description: String?
    var industry: String?
    var companySize: String?
    var website: String?
    var videoUrl: String?
    var canton: String?
    var city: String?
    var address: String?
    var contactPersonName: String?
    var contactPersonRole: String?
    var links: [CompanyLinkInput]?
}

struct CompanyLinkInput: Encodable {
    let label: String
    let url: String
}

// MARK: - Sample Data

extension CompanyProfile {
    static let sample = CompanyProfile(
        id: "sample-1",
        companyName: "Swisscom AG",
        description: "Swisscom ist das führende Telekommunikationsunternehmen der Schweiz.",
        industry: "Telekommunikation",
        companySize: "10000+",
        website: "https://www.swisscom.ch",
        logoUrl: nil,
        videoUrl: nil,
        canton: "BE",
        city: "Bern",
        address: "Alte Tiefenaustrasse 6",
        contactPersonName: "Maria Müller",
        contactPersonRole: "HR Leiterin",
        isVerified: true,
        listingsCount: 5,
        photos: [],
        links: [],
        listings: nil
    )
}
