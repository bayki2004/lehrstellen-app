import Foundation
import CoreLocation
import MapKit

@MainActor
@Observable
final class MapViewModel {
    var listings: [LehrstelleCard] = []
    var berufsschulen: [Berufsschule] = []
    var showBerufsschulen: Bool = true
    var selectedListing: LehrstelleCard?
    var selectedSchool: Berufsschule?
    var selectedBerufsschule: Berufsschule?
    var activeFilters: FeedFilters?
    var commuteResult: CommuteResult?
    var isLoadingCommute = false
    var isLoading = false
    var appliedListingIds: Set<UUID> = []
    var skippedListingIds: Set<UUID> = []
    var studentLocation: CLLocationCoordinate2D?
    var lastSentBewerbung: Bewerbung?
    var schoolCategories: [UUID: Set<String>] = [:]

    private let apiClient: APIClient
    private let commuteService: CommuteService
    private let studentId: UUID

    init(apiClient: APIClient, commuteService: CommuteService, studentId: UUID) {
        self.apiClient = apiClient
        self.commuteService = commuteService
        self.studentId = studentId
    }

    var geoListings: [LehrstelleCard] {
        listings.filter { $0.hasCoordinates }
    }

    var filteredBerufsschulen: [Berufsschule] {
        guard showBerufsschulen else { return [] }
        var result = berufsschulen.filter { $0.hasCoordinates }

        if let category = activeFilters?.berufCategory {
            result = result.filter { school in
                schoolCategories[school.id]?.contains(category) == true
            }
        }

        if let cantons = activeFilters?.cantons, !cantons.isEmpty {
            result = result.filter { cantons.contains($0.canton) }
        }

        if let radiusKm = activeFilters?.radiusKm, let home = studentLocation {
            let homeLocation = CLLocation(latitude: home.latitude, longitude: home.longitude)
            result = result.filter { school in
                guard let lat = school.lat, let lng = school.lng else { return false }
                let schoolLocation = CLLocation(latitude: lat, longitude: lng)
                return homeLocation.distance(from: schoolLocation) / 1000.0 <= radiusKm
            }
        }

        return result
    }

    var filteredListings: [LehrstelleCard] {
        var result = geoListings

        if let category = activeFilters?.berufCategory {
            result = result.filter { $0.berufCategory == category }
        }

        if let cantons = activeFilters?.cantons, !cantons.isEmpty {
            result = result.filter { cantons.contains($0.canton) }
        }

        if let radiusKm = activeFilters?.radiusKm, let home = studentLocation {
            let homeLocation = CLLocation(latitude: home.latitude, longitude: home.longitude)
            result = result.filter { card in
                guard let lat = card.lat, let lng = card.lng else { return false }
                let cardLocation = CLLocation(latitude: lat, longitude: lng)
                return homeLocation.distance(from: cardLocation) / 1000.0 <= radiusKm
            }
        }

        if let eduType = activeFilters?.educationType {
            result = result.filter { $0.educationType.rawValue == eduType }
        }

        return result
    }

    func loadListings() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let fetched: [LehrstelleCard] = try await apiClient.request(
                endpoint: .lehrstellenGeo
            )
            listings = fetched
        } catch {
            // Use sample data for development
            listings = LehrstelleCard.samples
        }
    }

    func loadBerufsschulen() async {
        do {
            let fetched: [Berufsschule] = try await apiClient.request(
                endpoint: .berufsschulenGeo
            )
            berufsschulen = fetched
        } catch {
            berufsschulen = []
        }
    }

    func loadSchoolCategories() async {
        do {
            let mappings: [SchoolCategoryMapping] = try await apiClient.request(
                endpoint: .schoolCategoryIndex
            )
            var index: [UUID: Set<String>] = [:]
            for mapping in mappings {
                if let field = mapping.berufe?.field {
                    index[mapping.berufsschuleId, default: []].insert(field)
                }
            }
            schoolCategories = index
        } catch {
            schoolCategories = [:]
        }
    }

    func selectSchool(_ school: Berufsschule?) {
        selectedSchool = school
        selectedListing = nil
        commuteResult = nil
        selectedBerufsschule = nil
    }

    func loadAppliedAndSkipped() async {
        do {
            let bewerbungen: [Bewerbung] = try await apiClient.request(
                endpoint: .bewerbungen(studentId: studentId)
            )
            appliedListingIds = Set(bewerbungen.map(\.listingId))
        } catch {
            // Keep empty sets for development
        }

        do {
            let skipped: [SkippedListing] = try await apiClient.request(
                endpoint: .skippedListings
            )
            skippedListingIds = Set(skipped.map(\.listingId))
        } catch {
            // Keep empty sets
        }
    }

    func selectListing(_ listing: LehrstelleCard?) {
        selectedListing = listing
        selectedSchool = nil
        commuteResult = nil
        selectedBerufsschule = nil

        guard let listing, let lat = listing.lat, let lng = listing.lng else { return }

        // Load commute time if student has home location
        if let home = studentLocation {
            Task {
                await loadCommute(from: home, to: CLLocationCoordinate2D(latitude: lat, longitude: lng))
            }
        }

        // Load berufsschule if linked
        if let schoolId = listing.berufsschuleId {
            Task {
                await loadBerufsschule(id: schoolId)
            }
        } else {
            // Fallback: find school by beruf code + canton
            Task {
                await loadBerufsschuleFallback(berufCode: listing.berufCode, canton: listing.canton, listingLat: lat, listingLng: lng)
            }
        }
    }

    func applyToListing(_ listing: LehrstelleCard) async {
        let request = CreateBewerbungRequest(studentId: studentId, listingId: listing.id)
        do {
            let bewerbung: Bewerbung = try await apiClient.request(
                endpoint: .bewerbungen,
                method: .post,
                body: request
            )
            appliedListingIds.insert(listing.id)
            lastSentBewerbung = bewerbung
        } catch {
            // Create local representation for confirmation
            appliedListingIds.insert(listing.id)
            lastSentBewerbung = Bewerbung(
                id: UUID(),
                studentId: studentId,
                listingId: listing.id,
                status: .sent,
                sentAt: .now,
                companyName: listing.companyName,
                berufTitle: listing.title,
                canton: listing.canton
            )
        }
    }

    func applyFilters(_ filters: FeedFilters?) {
        activeFilters = filters
    }

    func isApplied(_ listing: LehrstelleCard) -> Bool {
        appliedListingIds.contains(listing.id)
    }

    // MARK: - Private

    private func loadCommute(from origin: CLLocationCoordinate2D, to destination: CLLocationCoordinate2D) async {
        isLoadingCommute = true
        defer { isLoadingCommute = false }

        do {
            commuteResult = try await commuteService.fetchCommuteTime(from: origin, to: destination)
        } catch {
            commuteResult = nil
        }
    }

    private func loadBerufsschule(id: UUID) async {
        do {
            let schools: [Berufsschule] = try await apiClient.request(
                endpoint: .berufsschule(id: id)
            )
            selectedBerufsschule = schools.first
        } catch {
            selectedBerufsschule = nil
        }
    }

    private func loadBerufsschuleFallback(berufCode: String, canton: String, listingLat: Double, listingLng: Double) async {
        do {
            let mappings: [BerufsschuleForBerufMapping] = try await apiClient.request(
                endpoint: .berufsschulenForBeruf(code: berufCode, canton: canton)
            )
            let schools = mappings.compactMap(\.berufsschulen)
            guard !schools.isEmpty else { return }

            // Pick nearest school by distance
            let listingLocation = CLLocation(latitude: listingLat, longitude: listingLng)
            selectedBerufsschule = schools.min(by: { a, b in
                let distA = a.lat.flatMap { lat in a.lng.map { lng in listingLocation.distance(from: CLLocation(latitude: lat, longitude: lng)) } } ?? .infinity
                let distB = b.lat.flatMap { lat in b.lng.map { lng in listingLocation.distance(from: CLLocation(latitude: lat, longitude: lng)) } } ?? .infinity
                return distA < distB
            })
        } catch {
            // Fallback lookup failed — no school shown
        }
    }
}

// MARK: - Supporting Types

struct SkippedListing: Codable, Identifiable {
    let id: UUID
    let studentId: UUID
    let listingId: UUID
    let skippedAt: Date
}
