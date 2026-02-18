import SwiftUI

struct FilterSheetView: View {
    @Environment(NavigationRouter.self) private var router
    @State private var selectedCantons: Set<Canton> = [.zurich, .bern]
    @State private var selectedBerufsfelder: Set<Berufsfeld> = []
    @State private var educationType: EducationType? = nil
    @State private var minCompatibility: Double = 0.5
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Kantone") {
                    ForEach(Canton.allCases) { canton in
                        Toggle(canton.displayName, isOn: Binding(
                            get: { selectedCantons.contains(canton) },
                            set: { isOn in
                                if isOn { selectedCantons.insert(canton) }
                                else { selectedCantons.remove(canton) }
                            }
                        ))
                    }
                }

                Section("Berufsfelder") {
                    ForEach(Berufsfeld.allCases) { feld in
                        Toggle(isOn: Binding(
                            get: { selectedBerufsfelder.contains(feld) },
                            set: { isOn in
                                if isOn { selectedBerufsfelder.insert(feld) }
                                else { selectedBerufsfelder.remove(feld) }
                            }
                        )) {
                            Label(feld.displayName, systemImage: feld.icon)
                        }
                    }
                }

                Section("Ausbildungstyp") {
                    Picker("Typ", selection: $educationType) {
                        Text("Alle").tag(nil as EducationType?)
                        Text("EFZ (3-4 Jahre)").tag(EducationType.efz as EducationType?)
                        Text("EBA (2 Jahre)").tag(EducationType.eba as EducationType?)
                    }
                    .pickerStyle(.segmented)
                }

                Section("Mindest-Kompatibilität") {
                    VStack {
                        Slider(value: $minCompatibility, in: 0...1, step: 0.05)
                        Text("\(Int(minCompatibility * 100))% Mindest-Match")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.textSecondary)
                    }
                }
            }
            .navigationTitle("Filter")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Zurücksetzen") {
                        selectedCantons = Set(Canton.allCases)
                        selectedBerufsfelder = []
                        educationType = nil
                        minCompatibility = 0.5
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Fertig") {
                        let filters = FeedFilters(
                            cantons: selectedCantons.count < Canton.allCases.count
                                ? selectedCantons.map(\.rawValue) : nil,
                            berufsfelder: selectedBerufsfelder.isEmpty
                                ? nil : selectedBerufsfelder.map(\.displayName),
                            educationType: educationType?.rawValue,
                            minCompatibility: minCompatibility > 0 ? minCompatibility : nil
                        )
                        router.pendingFilters = filters
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
    }
}
