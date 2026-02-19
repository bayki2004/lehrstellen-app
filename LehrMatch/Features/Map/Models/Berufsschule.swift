import Foundation

struct Berufsschule: Identifiable, Codable, Hashable {
    let id: UUID
    let name: String
    let canton: String
    let city: String
    let address: String?
    let postalCode: String?
    let lat: Double?
    let lng: Double?
    let website: String?
    var email: String?
    var phone: String?

    var hasCoordinates: Bool {
        lat != nil && lng != nil
    }
}
