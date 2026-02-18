import SwiftUI

struct EducationStepView: View {
    @Bindable var viewModel: ProfileBuilderViewModel
    @State private var showAddSchool = false
    @State private var editingSchool: School?
    @State private var schoolName = ""
    @State private var schoolLevel = "Sekundarschule"
    @State private var startYear = Calendar.current.component(.year, from: .now) - 3
    @State private var endYear = Calendar.current.component(.year, from: .now)
    @State private var isCurrent = true

    private let levels = ["Primarschule", "Sekundarschule", "Sek A", "Sek B", "Sek C", "Gymnasium", "10. Schuljahr", "Andere"]

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            VStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "graduationcap.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(Theme.Colors.primaryFallback)

                Text("Deine Schulbildung")
                    .font(Theme.Typography.title)

                Text("Welche Schulen hast du besucht oder besuchst du gerade?")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            // School list
            ForEach(viewModel.schools) { school in
                schoolCard(school)
            }

            // Add button
            Button {
                resetForm()
                showAddSchool = true
            } label: {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("Schule hinzufügen")
                }
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.primaryFallback)
                .frame(maxWidth: .infinity)
                .padding(Theme.Spacing.md)
                .background(Theme.Colors.primaryFallback.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
            }
        }
        .sheet(isPresented: $showAddSchool) {
            schoolForm
        }
    }

    private func schoolCard(_ school: School) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(school.name)
                    .font(Theme.Typography.headline)
                Text(school.level)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
                Text(school.isCurrent ? "Seit \(school.startYear)" : "\(school.startYear) - \(school.endYear ?? school.startYear)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            Spacer()
            Button {
                viewModel.schools.removeAll { $0.id == school.id }
            } label: {
                Image(systemName: "trash")
                    .foregroundStyle(Theme.Colors.swipeLeft)
            }
        }
        .padding(Theme.Spacing.md)
        .background(Theme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
        .cardShadow()
    }

    private var schoolForm: some View {
        NavigationStack {
            Form {
                TextField("Schulname", text: $schoolName)
                Picker("Stufe", selection: $schoolLevel) {
                    ForEach(levels, id: \.self) { Text($0) }
                }
                Stepper("Startjahr: \(startYear)", value: $startYear, in: 2010...2030)
                Toggle("Aktuell", isOn: $isCurrent)
                if !isCurrent {
                    Stepper("Endjahr: \(endYear)", value: $endYear, in: startYear...2035)
                }
            }
            .navigationTitle("Schule hinzufügen")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { showAddSchool = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Speichern") {
                        let school = School(
                            id: UUID(),
                            name: schoolName,
                            level: schoolLevel,
                            startYear: startYear,
                            endYear: isCurrent ? nil : endYear,
                            isCurrent: isCurrent
                        )
                        viewModel.schools.append(school)
                        showAddSchool = false
                    }
                    .disabled(schoolName.isEmpty)
                }
            }
        }
        .presentationDetents([.medium])
    }

    private func resetForm() {
        schoolName = ""
        schoolLevel = "Sekundarschule"
        startYear = Calendar.current.component(.year, from: .now) - 3
        endYear = Calendar.current.component(.year, from: .now)
        isCurrent = true
    }
}
