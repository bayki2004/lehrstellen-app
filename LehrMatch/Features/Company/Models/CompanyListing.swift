import Foundation

/// Listing (Lehrstelle) from the company perspective. Matches Prisma ListingDTO.
struct CompanyListing: Codable, Identifiable {
    let id: String
    let companyId: String
    let companyName: String
    let companyLogo: String?
    let companyCanton: String
    let companyCity: String
    let title: String
    let description: String
    let field: String
    let canton: String
    let city: String
    let durationYears: Int
    let startDate: String?
    let spotsAvailable: Int
    let requiredSchoolLevel: String?
    let requiredLanguages: [String]
    let createdAt: String
    var isActive: Bool?
}

/// Request to create a new listing.
struct CreateListingRequest: Encodable {
    let title: String
    let description: String
    let field: String
    let berufsfeld: String?
    let requiredSchoolLevel: String?
    let requiredLanguages: [String]?
    let startDate: String?
    let durationYears: Int?
    let spotsAvailable: Int?
    let canton: String
    let city: String
    let idealOceanOpenness: Double?
    let idealOceanConscientiousness: Double?
    let idealOceanExtraversion: Double?
    let idealOceanAgreeableness: Double?
    let idealOceanNeuroticism: Double?
    let idealRiasecRealistic: Double?
    let idealRiasecInvestigative: Double?
    let idealRiasecArtistic: Double?
    let idealRiasecSocial: Double?
    let idealRiasecEnterprising: Double?
    let idealRiasecConventional: Double?
}

/// Request to update an existing listing.
struct UpdateListingRequest: Encodable {
    var title: String?
    var description: String?
    var field: String?
    var canton: String?
    var city: String?
    var durationYears: Int?
    var spotsAvailable: Int?
    var isActive: Bool?
}

// MARK: - Sample Data
extension CompanyListing {
    static let samples: [CompanyListing] = [
        CompanyListing(
            id: "listing-1",
            companyId: "company-1",
            companyName: "Swisscom AG",
            companyLogo: nil,
            companyCanton: "BE",
            companyCity: "Bern",
            title: "Informatiker/in EFZ",
            description: "Lerne die Welt der IT bei Swisscom kennen.",
            field: "Informatik",
            canton: "BE",
            city: "Bern",
            durationYears: 4,
            startDate: "2026-08-01",
            spotsAvailable: 3,
            requiredSchoolLevel: "Sek A",
            requiredLanguages: ["de"],
            createdAt: "2026-01-15",
            isActive: true
        ),
    ]
}
