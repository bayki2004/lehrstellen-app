import Foundation

struct StudentProfile: Identifiable, Codable {
    let id: UUID
    var firstName: String
    var lastName: String
    var dateOfBirth: Date
    var canton: String
    var city: String?
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

    // V2: Bewerbung profile fields
    var phone: String?
    var nationality: String?
    var motivationVideoUrl: String?
    var videoThumbnailUrl: String?
    var videoDurationSeconds: Int?
    var motivationLetter: String?
    var schools: [School]
    var languages: [Language]
    var hobbies: [String]
    var referencesList: [Reference]
    var profileCompleteness: Int

    // Map / commute fields
    var homeAddress: String?
    var homeLat: Double?
    var homeLng: Double?

    var fullName: String { "\(firstName) \(lastName)" }

    var age: Int {
        Calendar.current.dateComponents([.year], from: dateOfBirth, to: .now).year ?? 0
    }

    var profilePhotoURL: URL? {
        guard let url = profilePhotoUrl else { return nil }
        return URL(string: url)
    }

    init(
        id: UUID = UUID(),
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        canton: String,
        city: String? = nil,
        schoolName: String = "",
        schoolYear: String = "",
        preferredLanguage: AppLanguage = .de,
        profilePhotoUrl: String? = nil,
        bio: String? = nil,
        interests: [String] = [],
        skills: [String] = [],
        schnupperlehreExperience: [SchnupperlehreEntry] = [],
        multicheckScore: Int? = nil,
        personalityProfile: PersonalityProfile? = nil,
        phone: String? = nil,
        nationality: String? = nil,
        motivationVideoUrl: String? = nil,
        videoThumbnailUrl: String? = nil,
        videoDurationSeconds: Int? = nil,
        motivationLetter: String? = nil,
        schools: [School] = [],
        languages: [Language] = [],
        hobbies: [String] = [],
        referencesList: [Reference] = [],
        profileCompleteness: Int = 0,
        homeAddress: String? = nil,
        homeLat: Double? = nil,
        homeLng: Double? = nil
    ) {
        self.id = id
        self.firstName = firstName
        self.lastName = lastName
        self.dateOfBirth = dateOfBirth
        self.canton = canton
        self.city = city
        self.schoolName = schoolName
        self.schoolYear = schoolYear
        self.preferredLanguage = preferredLanguage
        self.profilePhotoUrl = profilePhotoUrl
        self.bio = bio
        self.interests = interests
        self.skills = skills
        self.schnupperlehreExperience = schnupperlehreExperience
        self.multicheckScore = multicheckScore
        self.personalityProfile = personalityProfile
        self.phone = phone
        self.nationality = nationality
        self.motivationVideoUrl = motivationVideoUrl
        self.videoThumbnailUrl = videoThumbnailUrl
        self.videoDurationSeconds = videoDurationSeconds
        self.motivationLetter = motivationLetter
        self.schools = schools
        self.languages = languages
        self.hobbies = hobbies
        self.referencesList = referencesList
        self.profileCompleteness = profileCompleteness
        self.homeAddress = homeAddress
        self.homeLat = homeLat
        self.homeLng = homeLng
    }
}

// MARK: - Nested Types

struct School: Codable, Identifiable {
    let id: UUID
    var name: String
    var level: String
    var startYear: Int
    var endYear: Int?
    var isCurrent: Bool
}

struct Language: Codable, Identifiable {
    let id: UUID
    var name: String
    var proficiency: LanguageProficiency
}

enum LanguageProficiency: String, Codable, CaseIterable {
    case a1, a2, b1, b2, c1, c2, native

    var displayName: String {
        switch self {
        case .a1: "A1 - Anfänger"
        case .a2: "A2 - Grundlagen"
        case .b1: "B1 - Mittelstufe"
        case .b2: "B2 - Gute Mittelstufe"
        case .c1: "C1 - Fortgeschritten"
        case .c2: "C2 - Annähernd muttersprachlich"
        case .native: "Muttersprache"
        }
    }
}

struct Reference: Codable, Identifiable {
    let id: UUID
    var name: String
    var role: String
    var organization: String
    var email: String?
    var phone: String?
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
        personalityProfile: nil,
        schools: [
            School(id: UUID(), name: "Sekundarschule Musterhausen", level: "Sek A", startYear: 2023, endYear: nil, isCurrent: true)
        ],
        languages: [
            Language(id: UUID(), name: "Deutsch", proficiency: .native),
            Language(id: UUID(), name: "Englisch", proficiency: .b1)
        ],
        hobbies: ["Fussball", "Gaming", "Lesen"],
        profileCompleteness: 45
    )
}
