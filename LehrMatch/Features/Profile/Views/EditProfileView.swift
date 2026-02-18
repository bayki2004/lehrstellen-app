import SwiftUI

struct EditProfileView: View {
    @State private var profile: StudentProfile = .sample
    @State private var isSaving = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Form {
            Section("Persönliche Daten") {
                TextField("Vorname", text: $profile.firstName)
                TextField("Nachname", text: $profile.lastName)
                Picker("Kanton", selection: $profile.canton) {
                    ForEach(Canton.allCases) { canton in
                        Text(canton.displayName).tag(canton.rawValue)
                    }
                }
            }

            Section("Schule") {
                TextField("Schule", text: $profile.schoolName)
                TextField("Schuljahr", text: $profile.schoolYear)
            }

            Section("Über mich") {
                TextField("Bio", text: Binding(
                    get: { profile.bio ?? "" },
                    set: { profile.bio = $0.isEmpty ? nil : $0 }
                ), axis: .vertical)
                .lineLimit(3...6)
            }

            Section("Interessen") {
                ForEach(profile.interests, id: \.self) { interest in
                    Text(interest)
                }
                .onDelete { indexSet in
                    profile.interests.remove(atOffsets: indexSet)
                }
            }

            Section("Skills") {
                ForEach(profile.skills, id: \.self) { skill in
                    Text(skill)
                }
                .onDelete { indexSet in
                    profile.skills.remove(atOffsets: indexSet)
                }
            }

            Section("Sprache") {
                Picker("App-Sprache", selection: $profile.preferredLanguage) {
                    ForEach(AppLanguage.allCases, id: \.self) { lang in
                        Text(lang.displayName).tag(lang)
                    }
                }
            }
        }
        .navigationTitle("Profil bearbeiten")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Speichern") {
                    isSaving = true
                    // Save to server
                    dismiss()
                }
                .fontWeight(.semibold)
                .disabled(isSaving)
            }
        }
    }
}
