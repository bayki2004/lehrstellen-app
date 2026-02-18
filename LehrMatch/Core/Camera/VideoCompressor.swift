import AVFoundation
import UIKit

enum VideoCompressor {
    /// Compress a video to medium quality MP4 format.
    static func compress(inputURL: URL) async throws -> URL {
        let outputURL = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension("mp4")

        let asset = AVURLAsset(url: inputURL)
        guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetMediumQuality) else {
            throw VideoCompressorError.exportSessionCreationFailed
        }

        exportSession.outputURL = outputURL
        exportSession.outputFileType = .mp4
        exportSession.shouldOptimizeForNetworkUse = true

        await exportSession.export()

        guard exportSession.status == .completed else {
            throw exportSession.error ?? VideoCompressorError.compressionFailed
        }

        return outputURL
    }

    /// Generate a thumbnail image from a video at a specific time.
    static func generateThumbnail(from videoURL: URL, at time: CMTime = CMTime(seconds: 0.5, preferredTimescale: 600)) async throws -> UIImage {
        let asset = AVURLAsset(url: videoURL)
        let generator = AVAssetImageGenerator(asset: asset)
        generator.appliesPreferredTrackTransform = true
        generator.maximumSize = CGSize(width: 640, height: 640)

        let (cgImage, _) = try await generator.image(at: time)
        return UIImage(cgImage: cgImage)
    }

    /// Get video duration in seconds.
    static func duration(of videoURL: URL) async throws -> Double {
        let asset = AVURLAsset(url: videoURL)
        let duration = try await asset.load(.duration)
        return CMTimeGetSeconds(duration)
    }
}

enum VideoCompressorError: LocalizedError {
    case exportSessionCreationFailed
    case compressionFailed

    var errorDescription: String? {
        switch self {
        case .exportSessionCreationFailed: "Video-Export konnte nicht erstellt werden."
        case .compressionFailed: "Video-Komprimierung fehlgeschlagen."
        }
    }
}
