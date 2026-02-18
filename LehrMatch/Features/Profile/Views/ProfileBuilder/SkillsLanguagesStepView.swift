import SwiftUI

struct SkillsLanguagesStepView: View {
    @Bindable var viewModel: ProfileBuilderViewModel
    @State private var showAddLanguage = false
    @State private var languageName = "Deutsch"
    @State private var proficiency: LanguageProficiency = .b1

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            // Languages
            sectionHeader(icon: "globe", title: "Sprachen")

            ForEach(viewModel.languages) { lang in
                languageRow(lang)
            }

            Button {
                showAddLanguage = true
            } label: {
                addButtonLabel("Sprache hinzufügen")
            }

            Divider()

            // Skills
            sectionHeader(icon: "star.fill", title: "Skills & Stärken")

            FlowLayout(spacing: Theme.Spacing.sm) {
                ForEach(viewModel.skills, id: \.self) { skill in
                    tagView(skill) {
                        viewModel.skills.removeAll { $0 == skill }
                    }
                }
            }

            HStack {
                TextField("Neuer Skill", text: $viewModel.newSkill)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { viewModel.addSkill() }
                Button("Hinzufügen") { viewModel.addSkill() }
                    .disabled(viewModel.newSkill.isEmpty)
            }

            Divider()

            // Hobbies
            sectionHeader(icon: "heart.fill", title: "Hobbies & Interessen")

            FlowLayout(spacing: Theme.Spacing.sm) {
                ForEach(viewModel.hobbies, id: \.self) { hobby in
                    tagView(hobby) {
                        viewModel.hobbies.removeAll { $0 == hobby }
                    }
                }
            }

            HStack {
                TextField("Neues Hobby", text: $viewModel.newHobby)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { viewModel.addHobby() }
                Button("Hinzufügen") { viewModel.addHobby() }
                    .disabled(viewModel.newHobby.isEmpty)
            }
        }
        .sheet(isPresented: $showAddLanguage) {
            languageForm
        }
    }

    private func sectionHeader(icon: String, title: String) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundStyle(Theme.Colors.primaryFallback)
            Text(title)
                .font(Theme.Typography.headline)
            Spacer()
        }
    }

    private func languageRow(_ language: Language) -> some View {
        HStack {
            Text(language.name)
                .font(Theme.Typography.body)
            Spacer()
            Text(language.proficiency.displayName)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
                .padding(.horizontal, Theme.Spacing.sm)
                .padding(.vertical, Theme.Spacing.xs)
                .background(Theme.Colors.backgroundSecondary)
                .clipShape(Capsule())
            Button {
                viewModel.languages.removeAll { $0.id == language.id }
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
        }
        .padding(Theme.Spacing.sm)
    }

    private func tagView(_ text: String, onRemove: @escaping () -> Void) -> some View {
        HStack(spacing: Theme.Spacing.xs) {
            Text(text)
                .font(Theme.Typography.caption)
            Button(action: onRemove) {
                Image(systemName: "xmark.circle.fill")
                    .font(.caption2)
            }
        }
        .foregroundStyle(Theme.Colors.primaryFallback)
        .padding(.horizontal, Theme.Spacing.sm)
        .padding(.vertical, Theme.Spacing.xs)
        .background(Theme.Colors.primaryFallback.opacity(0.1))
        .clipShape(Capsule())
    }

    private func addButtonLabel(_ title: String) -> some View {
        HStack {
            Image(systemName: "plus.circle.fill")
            Text(title)
        }
        .font(Theme.Typography.body)
        .foregroundStyle(Theme.Colors.primaryFallback)
        .frame(maxWidth: .infinity)
        .padding(Theme.Spacing.sm)
        .background(Theme.Colors.primaryFallback.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.small))
    }

    private var languageForm: some View {
        NavigationStack {
            Form {
                Picker("Sprache", selection: $languageName) {
                    ForEach(["Deutsch", "Französisch", "Italienisch", "Englisch", "Spanisch", "Portugiesisch", "Türkisch", "Albanisch", "Serbisch", "Andere"], id: \.self) {
                        Text($0)
                    }
                }
                Picker("Niveau", selection: $proficiency) {
                    ForEach(LanguageProficiency.allCases, id: \.self) {
                        Text($0.displayName).tag($0)
                    }
                }
            }
            .navigationTitle("Sprache")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { showAddLanguage = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Speichern") {
                        let lang = Language(id: UUID(), name: languageName, proficiency: proficiency)
                        viewModel.languages.append(lang)
                        showAddLanguage = false
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }
}