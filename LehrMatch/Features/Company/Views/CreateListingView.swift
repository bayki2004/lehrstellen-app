import SwiftUI

struct CreateListingView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var description = ""
    @State private var selectedField = "Informatik"
    @State private var canton = "ZH"
    @State private var city = ""
    @State private var durationYears = 3
    @State private var spotsAvailable = 1
    @State private var schoolLevel = ""
    @State private var isSaving = false
    @State private var showPersonality = false

    // Ideal personality (optional)
    @State private var oceanOpenness: Double = 0.5
    @State private var oceanConscientiousness: Double = 0.5
    @State private var oceanExtraversion: Double = 0.5
    @State private var oceanAgreeableness: Double = 0.5
    @State private var oceanNeuroticism: Double = 0.5
    @State private var riasecRealistic: Double = 0.0
    @State private var riasecInvestigative: Double = 0.0
    @State private var riasecArtistic: Double = 0.0
    @State private var riasecSocial: Double = 0.0
    @State private var riasecEnterprising: Double = 0.0
    @State private var riasecConventional: Double = 0.0

    let apiClient: ExpressAPIClient
    let onCreated: () -> Void

    private let fields = [
        "Informatik", "Kaufmann/Kauffrau", "Mediamatiker/in", "Polymechaniker/in",
        "Elektroinstallateur/in", "Fachmann Gesundheit", "Koch/Köchin",
        "Detailhandel", "Logistiker/in", "Zeichner/in", "Schreiner/in", "Grafiker/in"
    ]

    private let cantons = [
        "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR",
        "JU", "LU", "NE", "NW", "OW", "SG", "SH", "SO", "SZ", "TG",
        "TI", "UR", "VD", "VS", "ZG", "ZH"
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Grunddaten") {
                    TextField("Titel", text: $title)
                    TextField("Beschreibung", text: $description, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section("Berufsfeld & Standort") {
                    Picker("Berufsfeld", selection: $selectedField) {
                        ForEach(fields, id: \.self) { Text($0) }
                    }
                    Picker("Kanton", selection: $canton) {
                        ForEach(cantons, id: \.self) { Text($0) }
                    }
                    TextField("Stadt", text: $city)
                }

                Section("Details") {
                    Stepper("Dauer: \(durationYears) Jahre", value: $durationYears, in: 1...5)
                    Stepper("Plätze: \(spotsAvailable)", value: $spotsAvailable, in: 1...10)
                    TextField("Schulniveau (optional)", text: $schoolLevel)
                }

                Section {
                    DisclosureGroup("Ideale Persönlichkeit (optional)", isExpanded: $showPersonality) {
                        VStack(spacing: Theme.Spacing.sm) {
                            Text("OCEAN")
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Colors.textSecondary)
                            PersonalitySlider(label: "Offenheit", value: $oceanOpenness)
                            PersonalitySlider(label: "Gewissenhaftigkeit", value: $oceanConscientiousness)
                            PersonalitySlider(label: "Extraversion", value: $oceanExtraversion)
                            PersonalitySlider(label: "Verträglichkeit", value: $oceanAgreeableness)
                            PersonalitySlider(label: "Neurotizismus", value: $oceanNeuroticism)

                            Divider().padding(.vertical, Theme.Spacing.xs)

                            Text("RIASEC")
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Colors.textSecondary)
                            PersonalitySlider(label: "Realistisch", value: $riasecRealistic)
                            PersonalitySlider(label: "Forschend", value: $riasecInvestigative)
                            PersonalitySlider(label: "Künstlerisch", value: $riasecArtistic)
                            PersonalitySlider(label: "Sozial", value: $riasecSocial)
                            PersonalitySlider(label: "Unternehmerisch", value: $riasecEnterprising)
                            PersonalitySlider(label: "Konventionell", value: $riasecConventional)
                        }
                    }
                }
            }
            .navigationTitle("Neue Lehrstelle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Speichern") {
                        Task { await save() }
                    }
                    .disabled(title.isEmpty || description.isEmpty || city.isEmpty || isSaving)
                }
            }
            .overlay {
                if isSaving { ProgressView() }
            }
        }
    }

    private func save() async {
        isSaving = true
        defer { isSaving = false }

        let request = CreateListingRequest(
            title: title,
            description: description,
            field: selectedField,
            berufsfeld: nil,
            requiredSchoolLevel: schoolLevel.isEmpty ? nil : schoolLevel,
            requiredLanguages: ["de"],
            startDate: nil,
            durationYears: durationYears,
            spotsAvailable: spotsAvailable,
            canton: canton,
            city: city,
            idealOceanOpenness: showPersonality ? oceanOpenness : nil,
            idealOceanConscientiousness: showPersonality ? oceanConscientiousness : nil,
            idealOceanExtraversion: showPersonality ? oceanExtraversion : nil,
            idealOceanAgreeableness: showPersonality ? oceanAgreeableness : nil,
            idealOceanNeuroticism: showPersonality ? oceanNeuroticism : nil,
            idealRiasecRealistic: showPersonality ? riasecRealistic : nil,
            idealRiasecInvestigative: showPersonality ? riasecInvestigative : nil,
            idealRiasecArtistic: showPersonality ? riasecArtistic : nil,
            idealRiasecSocial: showPersonality ? riasecSocial : nil,
            idealRiasecEnterprising: showPersonality ? riasecEnterprising : nil,
            idealRiasecConventional: showPersonality ? riasecConventional : nil
        )

        let vm = CompanyListingsViewModel(apiClient: apiClient)
        if await vm.createListing(request) {
            onCreated()
            dismiss()
        }
    }
}

// MARK: - Personality Slider

private struct PersonalitySlider: View {
    let label: String
    @Binding var value: Double

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(label)
                    .font(Theme.Typography.caption)
                Spacer()
                Text(String(format: "%.0f%%", value * 100))
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }
            Slider(value: $value, in: 0...1, step: 0.05)
                .tint(Theme.Colors.primaryFallback)
        }
    }
}
