import Foundation

@MainActor
@Observable
final class VideoMotivationViewModel {
    var videos: [MotivationVideo] = []
    var currentVideo: MotivationVideo?
    var scriptText = ""
    var isGeneratingScript = false
    var isCreatingVideo = false
    var errorMessage: String?

    private let apiClient: APIClient
    private let studentId: UUID

    init(apiClient: APIClient, studentId: UUID) {
        self.apiClient = apiClient
        self.studentId = studentId
    }

    func loadVideos() async {
        do {
            videos = try await apiClient.request(
                endpoint: .motivationVideos(studentId: studentId)
            )
        } catch {
            videos = [MotivationVideo.sample]
        }
    }

    func generateScript(lehrstelleId: UUID?, matchId: UUID?, language: AppLanguage = .de) async {
        isGeneratingScript = true
        errorMessage = nil
        defer { isGeneratingScript = false }

        let request = GenerateScriptRequest(
            studentId: studentId,
            lehrstelleId: lehrstelleId,
            matchId: matchId,
            language: language.rawValue
        )

        do {
            let response: ScriptResponse = try await apiClient.request(
                endpoint: .generateScript,
                method: .post,
                body: request
            )
            scriptText = response.scriptText
            currentVideo = MotivationVideo(
                id: UUID(),
                studentId: studentId,
                lehrstelleId: lehrstelleId,
                matchId: matchId,
                scriptText: response.scriptText,
                generationStatus: .scriptReady,
                language: language,
                createdAt: .now
            )
        } catch {
            // Use sample script for development
            scriptText = MotivationVideo.sample.scriptText
            errorMessage = error.localizedDescription
        }
    }

    func createVideo() async {
        guard !scriptText.isEmpty else { return }
        isCreatingVideo = true
        errorMessage = nil
        defer { isCreatingVideo = false }

        let request = CreateVideoRequest(
            scriptText: scriptText,
            language: currentVideo?.language.rawValue ?? "de",
            studentId: studentId,
            lehrstelleId: currentVideo?.lehrstelleId
        )

        do {
            let response: VideoCreationResponse = try await apiClient.request(
                endpoint: .createVideo,
                method: .post,
                body: request
            )
            currentVideo?.generationStatus = .processing
            // Poll for completion or wait for push notification
            _ = response
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct ScriptResponse: Decodable {
    let scriptText: String
    let estimatedDurationSeconds: Int
}

struct VideoCreationResponse: Decodable {
    let videoId: UUID
    let estimatedCompletionSeconds: Int
}
