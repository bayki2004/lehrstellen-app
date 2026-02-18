import SwiftUI

struct ExperienceStepView: View {
    @Bindable var viewModel: ProfileBuilderViewModel
    @State private var showAddEntry = false
    @State private var companyName = ""
    @State private var beruf = ""
    @State private var canton: Canton = .zurich
    @State private var date = Date.now
    @State private var notes = ""

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            VStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "briefcase.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(Theme.Colors.primaryFallback)

                Text("Schnupperlehren & Erfahrung")
                    .font(Theme.Typography.title)

                Text("Hast du bereits Schnupperlehren oder Praktika gemacht?")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            ForEach(viewModel.schnupperlehren) { entry in
                experienceCard(entry)
            }

            Button {
                resetForm()
                showAddEntry = true
            } label: {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("Schnupperlehre hinzufügen")
                }
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.primaryFallback)
                .frame(maxWidth: .infinity)
                .padding(Theme.Spacing.md)
                .background(Theme.Colors.primaryFallback.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
            }

            Text("Optional — du kannst diesen Schritt überspringen.")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
        .sheet(isPresented: $showAddEntry) {
            entryForm
        }
    }

    private func experienceCard(_ entry: SchnupperlehreEntry) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(entry.companyName)
                    .font(Theme.Typography.headline)
                Text(entry.beruf)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)
                Text("\(entry.canton) — \(entry.date.formatted(.dateTime.month().year()))")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            Spacer()
            Button {
                viewModel.schnupperlehren.removeAll { $0.id == entry.id }
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

    private var entryForm: some View {
        NavigationStack {
            Form {
                TextField("Unternehmen", text: $companyName)
                TextField("Beruf", text: $beruf)
                Picker("Kanton", selection: $canton) {
                    ForEach(Canton.allCases) { c in
                        Text(c.displayName).tag(c)
                    }
                }
                DatePicker("Datum", selection: $date, displayedComponents: .date)
                TextField("Notizen (optional)", text: $notes)
            }
            .navigationTitle("Schnupperlehre")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { showAddEntry = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Speichern") {
                        let entry = SchnupperlehreEntry(
                            companyName: companyName,
                            beruf: beruf,
                            canton: canton.rawValue,
                            date: date,
                            notes: notes.isEmpty ? nil : notes
                        )
                        viewModel.schnupperlehren.append(entry)
                        showAddEntry = false
                    }
                    .disabled(companyName.isEmpty || beruf.isEmpty)
                }
            }
        }
        .presentationDetents([.medium])
    }

    private func resetForm() {
        companyName = ""
        beruf = ""
        canton = .zurich
        date = .now
        notes = ""
    }
}
