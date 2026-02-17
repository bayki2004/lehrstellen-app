import Foundation
import UserNotifications
import UIKit

final class NotificationManager: Sendable {
    static let shared = NotificationManager()

    private init() {}

    func requestPermission() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            return granted
        } catch {
            return false
        }
    }

    @MainActor
    func registerForRemoteNotifications() {
        Task {
            let granted = await requestPermission()
            if granted {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
    }

    func handleDeviceToken(_ token: Data) {
        let tokenString = token.map { String(format: "%02.2hhx", $0) }.joined()
        // Send token to Supabase backend
        _ = tokenString
    }

    func handleNotification(_ userInfo: [AnyHashable: Any]) {
        // Parse notification payload and route to appropriate screen
        if let matchId = userInfo["match_id"] as? String,
           let _ = UUID(uuidString: matchId) {
            // Navigate to match/chat
        }
    }
}
