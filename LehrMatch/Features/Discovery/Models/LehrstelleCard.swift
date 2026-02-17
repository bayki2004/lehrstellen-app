import Foundation

struct LehrstelleCard: Identifiable, Codable, Hashable {
    let id: UUID
    let companyId: UUID
    let companyName: String
    let companyLogoUrl: String?
    let berufCode: String
    let berufTitle: String
    let title: String
    let description: String
    let canton: String
    let city: String
    let educationType: EducationType
    let startDate: Date?
    let durationYears: Int
    let videoUrl: String?
    let photoUrls: [String]
    let cultureDescription: String?
    let cultureTags: [String]
    let requirements: [String]
    let compatibilityScore: Double
    let companySize: CompanySize?
    let isVerified: Bool
    let isPremium: Bool

    var compatibilityPercentage: Int {
        Int(compatibilityScore * 100)
    }

    var locationDisplay: String {
        "\(city), \(canton)"
    }

    var primaryPhotoUrl: URL? {
        guard let first = photoUrls.first else { return nil }
        return URL(string: first)
    }

    var companyLogoURL: URL? {
        guard let logo = companyLogoUrl else { return nil }
        return URL(string: logo)
    }
}

enum EducationType: String, Codable {
    case efz = "EFZ"
    case eba = "EBA"

    var displayName: String {
        switch self {
        case .efz: "EFZ (3-4 Jahre)"
        case .eba: "EBA (2 Jahre)"
        }
    }
}

enum CompanySize: String, Codable {
    case small = "small"       // 1-50
    case medium = "medium"     // 51-250
    case large = "large"       // 250+

    var displayName: String {
        switch self {
        case .small: "Kleinunternehmen"
        case .medium: "Mittelgrosses Unternehmen"
        case .large: "Grossunternehmen"
        }
    }
}

// MARK: - Sample Data

extension LehrstelleCard {
    static let samples: [LehrstelleCard] = [
        LehrstelleCard(
            id: UUID(),
            companyId: UUID(),
            companyName: "Swisscom AG",
            companyLogoUrl: nil,
            berufCode: "88611",
            berufTitle: "Informatiker/in EFZ",
            title: "Informatiker/in EFZ Applikationsentwicklung",
            description: "Lerne bei uns, wie man moderne Apps und Webservices entwickelt. Du arbeitest in einem dynamischen Team und setzt echte Projekte um.",
            canton: "ZH",
            city: "Zürich",
            educationType: .efz,
            startDate: Calendar.current.date(from: DateComponents(year: 2027, month: 8, day: 1)),
            durationYears: 4,
            videoUrl: nil,
            photoUrls: [],
            cultureDescription: "Innovation, Teamwork und Nachhaltigkeit sind unsere Werte.",
            cultureTags: ["Innovation", "Teamwork", "Flexibel", "Modern"],
            requirements: ["Sek A / Niveau E", "Gute Noten in Mathe", "Interesse an Technologie"],
            compatibilityScore: 0.87,
            companySize: .large,
            isVerified: true,
            isPremium: true
        ),
        LehrstelleCard(
            id: UUID(),
            companyId: UUID(),
            companyName: "Bäckerei Müller",
            companyLogoUrl: nil,
            berufCode: "21104",
            berufTitle: "Bäcker/in-Konditor/in EFZ",
            title: "Bäcker/in-Konditor/in EFZ",
            description: "Werde Teil unserer Familientradition! Seit 1956 backen wir mit Leidenschaft. Lerne das Handwerk von Grund auf.",
            canton: "BE",
            city: "Bern",
            educationType: .efz,
            startDate: Calendar.current.date(from: DateComponents(year: 2027, month: 8, day: 1)),
            durationYears: 3,
            videoUrl: nil,
            photoUrls: [],
            cultureDescription: "Familiäres Umfeld, Handwerkskunst, früh aufstehen lohnt sich!",
            cultureTags: ["Familiär", "Handwerk", "Tradition"],
            requirements: ["Sek B", "Teamfähigkeit", "Frühaufsteher"],
            compatibilityScore: 0.62,
            companySize: .small,
            isVerified: true,
            isPremium: false
        ),
        LehrstelleCard(
            id: UUID(),
            companyId: UUID(),
            companyName: "Universitätsspital Zürich",
            companyLogoUrl: nil,
            berufCode: "86914",
            berufTitle: "Fachfrau/-mann Gesundheit EFZ",
            title: "FaGe – Fachfrau/-mann Gesundheit EFZ",
            description: "Pflege Menschen und mache einen Unterschied. Am USZ erwartet dich ein vielseitiger Ausbildungsplatz mit modernster Infrastruktur.",
            canton: "ZH",
            city: "Zürich",
            educationType: .efz,
            startDate: Calendar.current.date(from: DateComponents(year: 2027, month: 8, day: 1)),
            durationYears: 3,
            videoUrl: nil,
            photoUrls: [],
            cultureDescription: "Menschlichkeit, Professionalität, Innovation in der Medizin.",
            cultureTags: ["Gesundheit", "Menschen helfen", "Vielseitig", "Modern"],
            requirements: ["Sek A oder B", "Empathie", "Teamfähigkeit", "Belastbarkeit"],
            compatibilityScore: 0.74,
            companySize: .large,
            isVerified: true,
            isPremium: true
        ),
    ]
}
