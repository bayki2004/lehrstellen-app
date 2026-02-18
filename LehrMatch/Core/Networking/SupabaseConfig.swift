import Foundation

/// Central configuration for connecting to Supabase.
/// In production, values come from the app's Info.plist or environment.
/// For local development, the defaults point to `supabase start` on localhost.
struct SupabaseConfig {
    let url: URL
    let anonKey: String
    let realtimeURL: URL

    /// Local development defaults (supabase start)
    static let local = SupabaseConfig(
        url: URL(string: "http://127.0.0.1:54321")!,
        anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
        realtimeURL: URL(string: "ws://127.0.0.1:54321/realtime/v1/websocket")!
    )

    /// Production configuration — reads from Info.plist
    static var production: SupabaseConfig {
        let bundle = Bundle.main
        guard let urlString = bundle.object(forInfoDictionaryKey: "SUPABASE_URL") as? String,
              let url = URL(string: urlString),
              let anonKey = bundle.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String else {
            fatalError("Missing SUPABASE_URL or SUPABASE_ANON_KEY in Info.plist")
        }
        let realtimeURLString = urlString
            .replacingOccurrences(of: "https://", with: "wss://")
            .replacingOccurrences(of: "http://", with: "ws://")
        return SupabaseConfig(
            url: url,
            anonKey: anonKey,
            realtimeURL: URL(string: "\(realtimeURLString)/realtime/v1/websocket")!
        )
    }

    /// Active configuration — uses local in DEBUG, production in release
    static var current: SupabaseConfig {
        #if DEBUG
        return .local
        #else
        return .production
        #endif
    }
}
