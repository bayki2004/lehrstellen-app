import SwiftUI
import MapKit

struct MapView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var viewModel: MapViewModel?
    @State private var cameraPosition: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 46.8182, longitude: 8.2275),
            span: MKCoordinateSpan(latitudeDelta: 2.5, longitudeDelta: 2.5)
        )
    )
    @State private var showBewerbungConfirmation = false

    var body: some View {
        ZStack(alignment: .top) {
            if let viewModel {
                mapContent(viewModel: viewModel)
            } else {
                ProgressView()
            }

            // Bewerbung sent confirmation overlay
            if showBewerbungConfirmation, let bewerbung = viewModel?.lastSentBewerbung {
                BewerbungSentConfirmationView(
                    companyName: bewerbung.companyName ?? "Unbekannt",
                    berufTitle: bewerbung.berufTitle ?? "Lehrstelle"
                ) {
                    showBewerbungConfirmation = false
                    viewModel?.lastSentBewerbung = nil
                }
                .transition(.opacity.combined(with: .scale))
            }
        }
        .navigationTitle("Karte")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    router.navigate(to: .filter)
                } label: {
                    Image(systemName: "slider.horizontal.3")
                }
            }
        }
        .task {
            if viewModel == nil {
                let vm = MapViewModel(
                    apiClient: appState.apiClient,
                    commuteService: CommuteService(),
                    studentId: appState.authManager.currentUserId ?? UUID()
                )
                viewModel = vm

                // Set student home location if available
                if let student = appState.currentStudent,
                   let lat = student.homeLat,
                   let lng = student.homeLng {
                    vm.studentLocation = CLLocationCoordinate2D(latitude: lat, longitude: lng)
                    cameraPosition = .region(MKCoordinateRegion(
                        center: CLLocationCoordinate2D(latitude: lat, longitude: lng),
                        span: MKCoordinateSpan(latitudeDelta: 0.3, longitudeDelta: 0.3)
                    ))
                }

                await vm.loadListings()
                await vm.loadBerufsschulen()
                await vm.loadSchoolCategories()
                await vm.loadAppliedAndSkipped()
            }
        }
        .onChange(of: router.pendingFilters) { _, newFilters in
            guard let filters = newFilters else { return }
            router.pendingFilters = nil
            viewModel?.applyFilters(filters)
        }
    }

    // MARK: - Map Content

    private func mapContent(viewModel: MapViewModel) -> some View {
        ZStack(alignment: .top) {
            Map(position: $cameraPosition) {
                // Listing pins
                ForEach(viewModel.filteredListings) { listing in
                    if let lat = listing.lat, let lng = listing.lng {
                        Annotation(listing.companyName, coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lng)) {
                            MapPinView(
                                berufCategory: listing.berufCategory,
                                isSelected: viewModel.selectedListing?.id == listing.id,
                                isApplied: viewModel.isApplied(listing)
                            )
                            .onTapGesture {
                                viewModel.selectListing(listing)
                            }
                        }
                    }
                }

                // Berufsschule pins
                ForEach(viewModel.filteredBerufsschulen) { school in
                    if let lat = school.lat, let lng = school.lng {
                        Annotation(school.name, coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lng)) {
                            BerufsschulePinView(
                                isSelected: viewModel.selectedSchool?.id == school.id
                            )
                            .onTapGesture {
                                viewModel.selectSchool(school)
                            }
                        }
                    }
                }

                // Student home pin
                if let home = viewModel.studentLocation {
                    Annotation("Mein Zuhause", coordinate: home) {
                        Image(systemName: "house.fill")
                            .font(.title3)
                            .foregroundStyle(.white)
                            .padding(8)
                            .background(Theme.Colors.primaryFallback)
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(.white, lineWidth: 2)
                            )
                    }
                }

                // Berufsschule pin for selected listing
                if viewModel.selectedSchool == nil,
                   let school = viewModel.selectedBerufsschule,
                   let lat = school.lat, let lng = school.lng {
                    Annotation(school.name, coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lng)) {
                        Image(systemName: "graduationcap.fill")
                            .font(.caption)
                            .foregroundStyle(.white)
                            .padding(6)
                            .background(.orange)
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(.white, lineWidth: 1.5)
                            )
                    }
                }
            }
            .mapStyle(.standard(elevation: .flat))

            // Filter bar overlay
            MapFilterBar(
                activeFilters: Binding(
                    get: { viewModel.activeFilters },
                    set: { viewModel.applyFilters($0) }
                ),
                showBerufsschulen: Binding(
                    get: { viewModel.showBerufsschulen },
                    set: { viewModel.showBerufsschulen = $0 }
                )
            )
            .padding(.top, Theme.Spacing.sm)

            // Bottom sheet for selected listing
            if let selected = viewModel.selectedListing {
                VStack {
                    Spacer()
                    ListingPreviewSheet(
                        listing: selected,
                        isApplied: viewModel.isApplied(selected),
                        commuteResult: viewModel.commuteResult,
                        isLoadingCommute: viewModel.isLoadingCommute,
                        berufsschule: viewModel.selectedBerufsschule,
                        onShowDetail: {
                            router.navigate(to: .cardDetail(id: selected.id))
                        },
                        onApply: {
                            Task {
                                await viewModel.applyToListing(selected)
                                withAnimation(Theme.Animation.matchCelebration) {
                                    showBewerbungConfirmation = true
                                }
                            }
                        },
                        onDismiss: {
                            viewModel.selectListing(nil)
                        }
                    )
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(Theme.Animation.standard, value: selected.id)
            }

            // Bottom sheet for selected school
            if let school = viewModel.selectedSchool {
                VStack {
                    Spacer()
                    BerufsschulePreviewSheet(
                        school: school,
                        onShowDetail: {
                            router.navigate(to: .berufsschuleDetail(id: school.id))
                        },
                        onDismiss: {
                            viewModel.selectSchool(nil)
                        }
                    )
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(Theme.Animation.standard, value: school.id)
            }
        }
    }
}
