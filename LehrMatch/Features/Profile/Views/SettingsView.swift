import SwiftUI

struct SettingsView: View {
    @Environment(AppState.self) private var appState
    @State private var showDeleteConfirmation = false

    var body: some View {
        Form {
            Section("Konto") {
                NavigationLink("Benachrichtigungen") {
                    NotificationSettingsView()
                }
                NavigationLink("Datenschutz") {
                    PrivacySettingsView()
                }
                NavigationLink("Eltern-Einverständnis") {
                    ParentalConsentStatusView()
                }
            }

            Section("App") {
                NavigationLink("Sprache") {
                    LanguageSettingsView()
                }
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }

            Section("Daten") {
                Button("Daten exportieren") {
                    // Request data export (DSAR)
                }
                Button("Konto löschen", role: .destructive) {
                    showDeleteConfirmation = true
                }
            }

            Section {
                Button("Abmelden", role: .destructive) {
                    Task { await appState.authManager.signOut() }
                    appState.signOut()
                }
            }
        }
        .navigationTitle("Einstellungen")
        .alert("Konto löschen?", isPresented: $showDeleteConfirmation) {
            Button("Abbrechen", role: .cancel) {}
            Button("Konto löschen", role: .destructive) {
                // Trigger account deletion flow
            }
        } message: {
            Text("Alle deine Daten werden innerhalb von 30 Tagen endgültig gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden.")
        }
    }
}

// MARK: - Sub-Settings Views

struct NotificationSettingsView: View {
    @State private var matchNotifications = true
    @State private var messageNotifications = true
    @State private var newPositionNotifications = true

    var body: some View {
        Form {
            Toggle("Neue Matches", isOn: $matchNotifications)
            Toggle("Nachrichten", isOn: $messageNotifications)
            Toggle("Neue Lehrstellen", isOn: $newPositionNotifications)
        }
        .navigationTitle("Benachrichtigungen")
    }
}

struct PrivacySettingsView: View {
    @State private var profileVisible = true
    @State private var showCompatibilityScore = true

    var body: some View {
        Form {
            Section("Sichtbarkeit") {
                Toggle("Profil für Firmen sichtbar", isOn: $profileVisible)
                Toggle("Kompatibilitäts-Score anzeigen", isOn: $showCompatibilityScore)
            }

            Section("Datenschutz") {
                Link("Datenschutzerklärung", destination: URL(string: "https://lehrmatch.ch/datenschutz")!)
                Link("Nutzungsbedingungen", destination: URL(string: "https://lehrmatch.ch/nutzungsbedingungen")!)
            }
        }
        .navigationTitle("Datenschutz")
    }
}

struct ParentalConsentStatusView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        Form {
            Section {
                HStack {
                    Text("Status")
                    Spacer()
                    statusBadge
                }
            }

            Section("Info") {
                Text("Das Einverständnis deiner Eltern erlaubt dir, alle Funktionen von LehrMatch zu nutzen — inklusive Swipen, Chatten und AI-Motivationsschreiben.")
                    .font(Theme.Typography.callout)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
        }
        .navigationTitle("Eltern-Einverständnis")
    }

    private var statusBadge: some View {
        let (text, color): (String, Color) = switch appState.parentalConsentStatus {
        case .notRequired: ("Nicht erforderlich", .green)
        case .pending: ("Ausstehend", .orange)
        case .granted: ("Erteilt", .green)
        case .revoked: ("Widerrufen", .red)
        }

        return Text(text)
            .font(Theme.Typography.badge)
            .foregroundStyle(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.1))
            .clipShape(Capsule())
    }
}

struct LanguageSettingsView: View {
    @State private var selectedLanguage: AppLanguage = .de

    var body: some View {
        Form {
            ForEach(AppLanguage.allCases, id: \.self) { language in
                Button {
                    selectedLanguage = language
                } label: {
                    HStack {
                        Text(language.displayName)
                            .foregroundStyle(Theme.Colors.textPrimary)
                        Spacer()
                        if selectedLanguage == language {
                            Image(systemName: "checkmark")
                                .foregroundStyle(Theme.Colors.primaryFallback)
                        }
                    }
                }
            }
        }
        .navigationTitle("Sprache")
    }
}

struct PersonalityResultsView: View {
    @Environment(AppState.self) private var appState
    @State private var quizViewModel: PersonalityQuizViewModel?
    @State private var showQuiz = false

    private var hasProfile: Bool {
        appState.currentStudent?.personalityProfile != nil
    }

    private var hollandCodes: HollandCodes? {
        appState.currentStudent?.personalityProfile?.hollandCodes
    }

    var body: some View {
        Group {
            if showQuiz, let quizVM = quizViewModel {
                PersonalityQuizView(
                    viewModel: quizVM,
                    revealButtonTitle: "Ergebnis anzeigen",
                    onComplete: {
                        // Update AppState with the new profile
                        if let profile = quizVM.personalityProfile {
                            appState.currentStudent?.personalityProfile = profile
                        }
                        Task { try? await quizVM.saveProfile() }
                        showQuiz = false
                        quizViewModel = nil
                    }
                )
            } else if let codes = hollandCodes {
                resultsContent(codes: codes)
            } else {
                // No profile yet — show quiz automatically
                ProgressView()
                    .onAppear { startQuiz() }
            }
        }
        .navigationTitle("Persönlichkeit")
    }

    private func startQuiz() {
        quizViewModel = PersonalityQuizViewModel(
            apiClient: appState.apiClient,
            studentId: appState.authManager.currentUserId ?? UUID()
        )
        showQuiz = true
    }

    private func resultsContent(codes: HollandCodes) -> some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                Text("Dein Persönlichkeitsprofil")
                    .font(Theme.Typography.title)
                    .padding(.top, Theme.Spacing.xl)

                Text("Dein Typ: \(codes.topThreeCodes.joined())")
                    .font(Theme.Typography.headline)
                    .foregroundStyle(Theme.Colors.primaryFallback)

                RadarChartView(
                    values: codes.asVector,
                    labels: ["R", "I", "A", "S", "E", "C"]
                )
                .frame(height: 250)
                .padding(.horizontal, Theme.Spacing.lg)

                VStack(spacing: Theme.Spacing.md) {
                    personalityBar(label: "Realistisch", value: codes.realistic, color: .blue)
                    personalityBar(label: "Forschend", value: codes.investigative, color: .green)
                    personalityBar(label: "Künstlerisch", value: codes.artistic, color: .purple)
                    personalityBar(label: "Sozial", value: codes.social, color: .orange)
                    personalityBar(label: "Unternehmerisch", value: codes.enterprising, color: .red)
                    personalityBar(label: "Konventionell", value: codes.conventional, color: .gray)
                }
                .padding(.horizontal, Theme.Spacing.lg)

                Button {
                    startQuiz()
                } label: {
                    HStack(spacing: Theme.Spacing.sm) {
                        Image(systemName: "arrow.counterclockwise")
                        Text("Quiz wiederholen")
                    }
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.primaryFallback)
                    .padding(Theme.Spacing.md)
                    .frame(maxWidth: .infinity)
                    .background(Theme.Colors.primaryFallback.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
                }
                .padding(.horizontal, Theme.Spacing.lg)
            }
            .padding(.bottom, Theme.Spacing.xxl)
        }
    }

    private func personalityBar(label: String, value: Double, color: Color) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            HStack {
                Text(label)
                    .font(Theme.Typography.callout)
                Spacer()
                Text("\(Int(value * 100))%")
                    .font(Theme.Typography.badge)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(color.opacity(0.15))
                    RoundedRectangle(cornerRadius: 4)
                        .fill(color.gradient)
                        .frame(width: geo.size.width * value)
                }
            }
            .frame(height: 12)
        }
    }
}
