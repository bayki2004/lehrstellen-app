import Foundation

struct StudentProfile: Identifiable, Codable {
    let id: UUID
    var firstName: String
    var lastName: String
    var dateOfBirth: Date
    var canton: String
    var schoolName: String
    var schoolYear: String
    var preferredLanguage: AppLanguage
    var profilePhotoUrl: String?
    var bio: String?
    var interests: [String]
    var skills: [String]
    var schnupperlehreExperience: [SchnupperlehreEntry]
    var multicheckScore: Int?
    var personalityProfile: PersonalityProfile?

    var fullName: String { "\(firstName) \(lastName)" }

    var age: Int {
        Calendar.current.dateComponents([.year], from: dateOfBirth, to: .now).year ?? 0
    }

    var profilePhotoURL: URL? {
        guard let url = profilePhotoUrl else { return nil }
        return URL(string: url)
    }
}

struct SchnupperlehreEntry: Codable, Identifiable {
    let id: UUID
    var companyName: String
    var beruf: String
    var canton: String
    var date: Date
    var notes: String?

    init(companyName: String, beruf: String, canton: String, date: Date, notes: String? = nil) {
        self.id = UUID()
        self.companyName = companyName
        self.beruf = beruf
        self.canton = canton
        self.date = date
        self.notes = notes
    }
}

enum AppLanguage: String, Codable, CaseIterable {
    case de = "de"
    case fr = "fr"
    case it = "it"

    var displayName: String {
        switch self {
        case .de: "Deutsch"
        case .fr: "Français"
        case .it: "Italiano"
        }
    }
}

// MARK: - Sample Data

extension StudentProfile {
    static let sample = StudentProfile(
        id: UUID(),
        firstName: "Max",
        lastName: "Muster",
        dateOfBirth: Calendar.current.date(byAdding: .year, value: -15, to: .now) ?? .now,
        canton: "ZH",
        schoolName: "Sekundarschule Musterhausen",
        schoolYear: "9. Klasse",
        preferredLanguage: .de,
        profilePhotoUrl: nil,
        bio: "Interessiert an Technologie und Design. Suche eine spannende Lehrstelle in der Region Zürich.",
        interests: ["Programmieren", "Gaming", "Fussball", "Design"],
        skills: ["Computer", "Teamarbeit", "Englisch"],
        schnupperlehreExperience: [
            SchnupperlehreEntry(
                companyName: "Google Zürich",
                beruf: "Informatiker/in",
                canton: "ZH",
                date: Calendar.current.date(byAdding: .month, value: -3, to: .now)!,
                notes: "Super spannend, tolles Team"
            )
        ],
        multicheckScore: nil,
        personalityProfile: nil
    )
}
