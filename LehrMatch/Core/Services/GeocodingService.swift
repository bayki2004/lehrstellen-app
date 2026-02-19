import Foundation
import CoreLocation

@MainActor
final class GeocodingService {
    private let geocoder = CLGeocoder()

    func geocode(address: String) async throws -> CLLocationCoordinate2D? {
        let placemarks = try await geocoder.geocodeAddressString(address + ", Schweiz")
        return placemarks.first?.location?.coordinate
    }

    func reverseGeocode(coordinate: CLLocationCoordinate2D) async throws -> String? {
        let location = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        let placemarks = try await geocoder.reverseGeocodeLocation(location)
        guard let placemark = placemarks.first else { return nil }
        return [placemark.thoroughfare, placemark.locality].compactMap { $0 }.joined(separator: ", ")
    }
}
