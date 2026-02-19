import SwiftUI
import PhotosUI

enum ProfileBuilderStep: Int, CaseIterable {
    case personalInfo
    case motivationVideo
    case motivationLetter
    case education
    case experience
    case skillsAndMore
    case documents

    var title: String {
        switch self {
        case .personalInfo: "Persönliche Daten"
        case .motivationVideo: "Motivationsvideo"
        case .motivationLetter: "Motivationsschreiben"
        case .education: "Ausbildung"
        case .experience: "Erfahrung"
        case .skillsAndMore: "Skills & Mehr"
        case .documents: "Zeugnisse"
        }
    }

    var icon: String {
        switch self {
        case .personalInfo: "person.fill"
        case .motivationVideo: "video.fill"
        case .motivationLetter: "doc.text.fill"
        case .education: "graduationcap.fill"
        case .experience: "briefcase.fill"
        case .skillsAndMore: "star.fill"
        case .documents: "doc.on.doc.fill"
        }
    }
}

@MainActor
@Observable
final class ProfileBuilderViewModel {
    var currentStepIndex: Int = 0
    var isLoading = false
    var errorMessage: String?

    // Personal info
    var firstName = ""
    var lastName = ""
    var dateOfBirth: Date = Calendar.current.date(byAdding: .year, value: -15, to: .now) ?? .now
    var canton: Canton = .zurich
    var city = ""
    var phone = ""
    var nationality = ""
    var profilePhotoUrl: String?
    var selectedPhoto: PhotosPickerItem?

    // Home address (for map / commute)
    var homeAddress = ""
    var homeLat: Double?
    var homeLng: Double?
    var addressStatus: AddressGeocodingStatus = .none

    // Video
    var motivationVideoUrl: String?
    var videoThumbnailUrl: String?
    var videoDurationSeconds: Int?

    // Letter
    var motivationLetter = ""

    // Education
    var schools: [School] = []

    // Experience
    var schnupperlehren: [SchnupperlehreEntry] = []

    // Skills & more
    var languages: [Language] = []
    var skills: [String] = []
    var hobbies: [String] = []
    var references: [Reference] = []
    var newSkill = ""
    var newHobby = ""

    // Documents
    var zeugnisse: [Zeugnis] = []

    private let apiClient: APIClient
    private let storageClient: StorageClient
    private let studentId: UUID

    init(apiClient: APIClient, storageClient: StorageClient, studentId: UUID) {
        self.apiClient = apiClient
        self.storageClient = storageClient
        self.studentId = studentId
    }

    var currentStep: ProfileBuilderStep {
        ProfileBuilderStep(rawValue: currentStepIndex) ?? .personalInfo
    }

    var totalSteps: Int { ProfileBuilderStep.allCases.count }

    var isFirstStep: Bool { currentStepIndex == 0 }
    var isLastStep: Bool { currentStepIndex == totalSteps - 1 }

    var progress: Double {
        Double(currentStepIndex + 1) / Double(totalSteps)
    }

    var profileCompleteness: Int {
        var score = 0
        if !firstName.isEmpty && !lastName.isEmpty { score += 5 }
        if phone.count > 5 { score += 5 }
        if !canton.rawValue.isEmpty { score += 5 }
        if profilePhotoUrl != nil { score += 5 }
        score += 5 // dateOfBirth always set
        if motivationVideoUrl != nil { score += 20 }
        if motivationLetter.count > 100 { score += 15 }
        if !schools.isEmpty { score += 10 }
        if !schnupperlehren.isEmpty { score += 5 }
        if !languages.isEmpty { score += 5 }
        if !skills.isEmpty { score += 5 }
        if !hobbies.isEmpty { score += 5 }
        if !zeugnisse.isEmpty { score += 10 }
        return min(score, 100)
    }

    func nextStep() {
        guard currentStepIndex < totalSteps - 1 else { return }
        currentStepIndex += 1
    }

    func previousStep() {
        guard currentStepIndex > 0 else { return }
        currentStepIndex -= 1
    }

    func loadExistingProfile(from profile: StudentProfile?) {
        guard let p = profile else { return }
        firstName = p.firstName
        lastName = p.lastName
        dateOfBirth = p.dateOfBirth
        canton = Canton(rawValue: p.canton) ?? .zurich
        city = p.city ?? ""
        phone = p.phone ?? ""
        nationality = p.nationality ?? ""
        profilePhotoUrl = p.profilePhotoUrl
        motivationVideoUrl = p.motivationVideoUrl
        motivationLetter = p.motivationLetter ?? ""
        schools = p.schools
        schnupperlehren = p.schnupperlehreExperience
        languages = p.languages
        skills = p.skills
        hobbies = p.hobbies
        homeAddress = p.homeAddress ?? ""
        homeLat = p.homeLat
        homeLng = p.homeLng
        zeugnisse = []
    }

    func addSkill() {
        let trimmed = newSkill.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !skills.contains(trimmed) else { return }
        skills.append(trimmed)
        newSkill = ""
    }

    func addHobby() {
        let trimmed = newHobby.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !hobbies.contains(trimmed) else { return }
        hobbies.append(trimmed)
        newHobby = ""
    }

    func uploadProfilePhoto(_ data: Data) async {
        do {
            let url = try await storageClient.uploadFile(
                data: data,
                fileName: "profile.\(UUID().uuidString.prefix(8)).jpg",
                bucket: "profile-photos",
                contentType: "image/jpeg",
                userId: studentId
            )
            profilePhotoUrl = url
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func uploadVideo(data: Data) async {
        isLoading = true
        defer { isLoading = false }
        do {
            let url = try await storageClient.uploadFile(
                data: data,
                fileName: "motivation.\(UUID().uuidString.prefix(8)).mp4",
                bucket: "motivation-videos",
                contentType: "video/mp4",
                userId: studentId
            )
            motivationVideoUrl = url
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func uploadZeugnis(data: Data, fileName: String, fileType: String) async {
        isLoading = true
        defer { isLoading = false }
        let contentType = fileType == "pdf" ? "application/pdf" : "image/jpeg"
        do {
            let url = try await storageClient.uploadFile(
                data: data,
                fileName: "zeugnis_\(UUID().uuidString.prefix(8))_\(fileName)",
                bucket: "zeugnisse",
                contentType: contentType,
                userId: studentId
            )
            let zeugnis = Zeugnis(
                id: UUID(),
                studentId: studentId,
                fileUrl: url,
                fileName: fileName,
                fileType: fileType,
                fileSizeBytes: Int64(data.count),
                uploadedAt: .now
            )
            zeugnisse.append(zeugnis)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func geocodeHomeAddress() async {
        let trimmed = homeAddress.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            addressStatus = .none
            homeLat = nil
            homeLng = nil
            return
        }

        addressStatus = .geocoding
        let geocoder = GeocodingService()
        do {
            if let coord = try await geocoder.geocode(address: trimmed) {
                homeLat = coord.latitude
                homeLng = coord.longitude
                addressStatus = .found
            } else {
                homeLat = nil
                homeLng = nil
                addressStatus = .notFound
            }
        } catch {
            homeLat = nil
            homeLng = nil
            addressStatus = .notFound
        }
    }

    func removeZeugnis(_ zeugnis: Zeugnis) {
        zeugnisse.removeAll { $0.id == zeugnis.id }
    }

    func saveProfile() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        // Build the profile update payload
        // The APIClient uses snake_case encoding automatically
        let payload = StudentProfileUpdate(
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            canton: canton.rawValue,
            city: city.isEmpty ? nil : city,
            phone: phone.isEmpty ? nil : phone,
            nationality: nationality.isEmpty ? nil : nationality,
            profilePhotoUrl: profilePhotoUrl,
            motivationVideoUrl: motivationVideoUrl,
            motivationLetter: motivationLetter.isEmpty ? nil : motivationLetter,
            schools: schools,
            schnupperlehreExperience: schnupperlehren,
            languages: languages,
            skills: skills,
            hobbies: hobbies,
            references: references.isEmpty ? nil : references,
            homeAddress: homeAddress.isEmpty ? nil : homeAddress,
            homeLat: homeLat,
            homeLng: homeLng
        )

        do {
            try await apiClient.requestVoid(
                endpoint: .student(id: studentId),
                method: .patch,
                body: payload
            )
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// MARK: - Profile Update Payload

private struct StudentProfileUpdate: Encodable {
    let firstName: String
    let lastName: String
    let dateOfBirth: Date
    let canton: String
    let city: String?
    let phone: String?
    let nationality: String?
    let profilePhotoUrl: String?
    let motivationVideoUrl: String?
    let motivationLetter: String?
    let schools: [School]
    let schnupperlehreExperience: [SchnupperlehreEntry]
    let languages: [Language]
    let skills: [String]
    let hobbies: [String]
    let references: [Reference]?
    let homeAddress: String?
    let homeLat: Double?
    let homeLng: Double?
}

enum AddressGeocodingStatus {
    case none
    case geocoding
    case found
    case notFound
}
