import Foundation

/// Express API endpoint paths for company-side features.
/// Matches routes defined in apps/api/src/app.ts.
enum ExpressEndpoint {
    // MARK: - Company Profile
    case companyMe
    case companyById(id: String)
    case createCompany
    case updateCompany
    case companyPhotos
    case deleteCompanyPhoto(id: String)
    case companyVideo
    case deleteCompanyVideo

    // MARK: - Listings
    case myListings
    case createListing
    case listing(id: String)
    case updateListing(id: String)
    case deleteListing(id: String)

    // MARK: - Matches
    case matches

    // MARK: - Applications
    case applications
    case createApplication
    case updateApplicationStatus(id: String)

    // MARK: - Chat
    case chatMessages(matchId: String)

    var path: String {
        switch self {
        // Company
        case .companyMe:                    "/companies/me"
        case .companyById(let id):          "/companies/\(id)"
        case .createCompany:                "/companies"
        case .updateCompany:                "/companies/me"
        case .companyPhotos:                "/companies/me/photos"
        case .deleteCompanyPhoto(let id):   "/companies/me/photos/\(id)"
        case .companyVideo:                 "/companies/me/video"
        case .deleteCompanyVideo:           "/companies/me/video"

        // Listings
        case .myListings:                   "/listings/my"
        case .createListing:                "/listings"
        case .listing(let id):              "/listings/\(id)"
        case .updateListing(let id):        "/listings/\(id)"
        case .deleteListing(let id):        "/listings/\(id)"

        // Matches
        case .matches:                      "/matches"

        // Applications
        case .applications:                 "/applications"
        case .createApplication:            "/applications"
        case .updateApplicationStatus(let id): "/applications/\(id)/status"

        // Chat
        case .chatMessages(let matchId):    "/chat/\(matchId)/messages"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .companyMe, .companyById, .myListings, .listing, .matches, .applications, .chatMessages:
            .get
        case .createCompany, .createListing, .companyPhotos, .companyVideo, .createApplication:
            .post
        case .updateCompany, .updateListing, .updateApplicationStatus:
            .patch
        case .deleteListing, .deleteCompanyPhoto, .deleteCompanyVideo:
            .delete
        }
    }
}
