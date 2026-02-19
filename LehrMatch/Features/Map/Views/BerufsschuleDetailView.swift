import SwiftUI
import MapKit

struct BerufsschuleDetailView: View {
    let schoolId: UUID

    @Environment(AppState.self) private var appState
    @State private var school: Berufsschule?
    @State private var berufe: [Beruf] = []
    @State private var isLoading = true

    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView()
                    .padding(.top, Theme.Spacing.xxl)
            } else if let school {
                VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    headerSection(school)
                    contactSection(school)
                    mapSection(school)
                    berufeSection
                }
                .padding(Theme.Spacing.md)
            }
        }
        .navigationTitle("Berufsschule")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadData()
        }
    }

    // MARK: - Header

    private func headerSection(_ school: Berufsschule) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            HStack(spacing: Theme.Spacing.md) {
                Image(systemName: "graduationcap.fill")
                    .font(.title)
                    .foregroundStyle(.white)
                    .frame(width: 56, height: 56)
                    .background(.orange)
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 4) {
                    Text(school.name)
                        .font(Theme.Typography.title)
                    Text("\(school.city), \(school.canton)")
                        .font(Theme.Typography.callout)
                        .foregroundStyle(Theme.Colors.textSecondary)
                }
            }

            if let address = school.address {
                Label(address, systemImage: "mappin")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
            }

            if let postalCode = school.postalCode {
                Text("\(postalCode) \(school.city)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
        }
    }

    // MARK: - Contact

    private func contactSection(_ school: Berufsschule) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Kontakt")
                .font(Theme.Typography.headline)

            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                if let email = school.email {
                    Link(destination: URL(string: "mailto:\(email)")!) {
                        Label(email, systemImage: "envelope")
                            .font(Theme.Typography.body)
                    }
                }

                if let phone = school.phone {
                    Link(destination: URL(string: "tel:\(phone)")!) {
                        Label(phone, systemImage: "phone")
                            .font(Theme.Typography.body)
                    }
                }

                if let website = school.website, let url = URL(string: website) {
                    Link(destination: url) {
                        Label("Website", systemImage: "globe")
                            .font(Theme.Typography.body)
                    }
                }
            }
        }
        .padding(Theme.Spacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.Colors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
    }

    // MARK: - Map

    @ViewBuilder
    private func mapSection(_ school: Berufsschule) -> some View {
        if let lat = school.lat, let lng = school.lng {
            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                Text("Standort")
                    .font(Theme.Typography.headline)

                Map {
                    Annotation(school.name, coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lng)) {
                        BerufsschulePinView(isSelected: true)
                    }
                }
                .mapStyle(.standard(elevation: .flat))
                .frame(height: 180)
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
            }
        }
    }

    // MARK: - Berufe

    private var berufeSection: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text("Ausbildungsangebot")
                .font(Theme.Typography.headline)

            if berufe.isEmpty {
                Text("Keine Berufe hinterlegt")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
                    .padding(.vertical, Theme.Spacing.sm)
            } else {
                LazyVStack(spacing: Theme.Spacing.xs) {
                    ForEach(berufe) { beruf in
                        BerufRowView(beruf: beruf)
                    }
                }
            }
        }
    }

    // MARK: - Data Loading

    private func loadData() async {
        isLoading = true
        defer { isLoading = false }

        let apiClient = appState.apiClient

        // Load school details
        do {
            let schools: [Berufsschule] = try await apiClient.request(
                endpoint: .berufsschule(id: schoolId)
            )
            school = schools.first
        } catch {
            // Keep nil
        }

        // Load berufe taught at this school
        do {
            let mappings: [BerufsschuleBerufMapping] = try await apiClient.request(
                endpoint: .berufsschulBerufe(schoolId: schoolId)
            )
            berufe = mappings.compactMap(\.berufe)
        } catch {
            berufe = []
        }
    }
}
