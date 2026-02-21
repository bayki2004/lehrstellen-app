import SwiftUI

struct CompanyProfileView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel: CompanyProfileViewModel?

    var body: some View {
        Group {
            if let vm = viewModel {
                profileContent(vm)
            } else {
                ProgressView()
            }
        }
        .task {
            if viewModel == nil {
                viewModel = CompanyProfileViewModel(apiClient: appState.expressClient)
            }
            await viewModel?.loadProfile()
        }
    }

    private func profileContent(_ vm: CompanyProfileViewModel) -> some View {
        List {
            if let profile = vm.profile {
                // Header
                headerSection(profile)

                // About
                aboutSection(vm, profile)

                // Photos
                photosSection(vm, profile)

                // Video
                videoSection(vm, profile)

                // Links
                linksSection(vm, profile)

                // Details
                detailsSection(profile)

                // Listings
                if let listings = profile.listings, !listings.isEmpty {
                    listingsSection(listings)
                }

                // Logout
                Section {
                    Button(role: .destructive) {
                        Task { await appState.expressClient.logout() }
                        Task { await appState.authManager.signOut() }
                        appState.signOut()
                    } label: {
                        HStack {
                            Spacer()
                            Text("Abmelden")
                            Spacer()
                        }
                    }
                }
            } else if vm.isLoading {
                Section {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("Profil")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                if vm.isEditing {
                    Button("Speichern") {
                        Task { await vm.saveProfile() }
                    }
                    .disabled(vm.isSaving)
                } else {
                    Button("Bearbeiten") {
                        vm.startEditing()
                    }
                }
            }
            if vm.isEditing {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") {
                        vm.cancelEditing()
                    }
                }
            }
        }
        .refreshable {
            await vm.loadProfile()
        }
    }

    // MARK: - Header

    private func headerSection(_ profile: CompanyProfile) -> some View {
        Section {
            HStack(spacing: Theme.Spacing.md) {
                // Logo placeholder
                Circle()
                    .fill(Theme.Colors.primaryFallback.opacity(0.15))
                    .frame(width: 64, height: 64)
                    .overlay {
                        Text(String(profile.companyName.prefix(1)))
                            .font(Theme.Typography.largeTitle)
                            .foregroundStyle(Theme.Colors.primaryFallback)
                    }

                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(profile.companyName)
                            .font(Theme.Typography.title)
                        if profile.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundStyle(Theme.Colors.primaryFallback)
                        }
                    }
                    Text(profile.industry)
                        .font(Theme.Typography.callout)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    Text("\(profile.canton) \(profile.city)")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textTertiary)
                }
            }
            .padding(.vertical, Theme.Spacing.xs)
        }
    }

    // MARK: - About

    private func aboutSection(_ vm: CompanyProfileViewModel, _ profile: CompanyProfile) -> some View {
        Section("Über uns") {
            if vm.isEditing {
                TextField("Beschreibung", text: $vm.editDescription, axis: .vertical)
                    .lineLimit(3...8)
            } else {
                Text(profile.description)
                    .font(Theme.Typography.body)
            }
        }
    }

    // MARK: - Photos

    private func photosSection(_ vm: CompanyProfileViewModel, _ profile: CompanyProfile) -> some View {
        Section("Fotos") {
            if profile.photos.isEmpty {
                Text("Noch keine Fotos")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: Theme.Spacing.sm) {
                        ForEach(profile.photos) { photo in
                            ZStack(alignment: .topTrailing) {
                                AsyncImage(url: URL(string: photo.url)) { image in
                                    image.resizable().scaledToFill()
                                } placeholder: {
                                    Color.gray.opacity(0.2)
                                }
                                .frame(width: 120, height: 90)
                                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.small))

                                if vm.isEditing {
                                    Button {
                                        Task { await vm.deletePhoto(id: photo.id) }
                                    } label: {
                                        Image(systemName: "xmark.circle.fill")
                                            .foregroundStyle(.white, .red)
                                    }
                                    .offset(x: 4, y: -4)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // MARK: - Video

    private func videoSection(_ vm: CompanyProfileViewModel, _ profile: CompanyProfile) -> some View {
        Section("Video") {
            if vm.isEditing {
                TextField("Video URL (YouTube)", text: $vm.editVideoUrl)
                    .textContentType(.URL)
                    .keyboardType(.URL)
            } else if let url = profile.videoUrl {
                HStack {
                    Image(systemName: "play.rectangle.fill")
                        .foregroundStyle(Theme.Colors.primaryFallback)
                    Text(url)
                        .font(Theme.Typography.caption)
                        .lineLimit(1)
                }
            } else {
                Text("Kein Video")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
        }
    }

    // MARK: - Links

    @ViewBuilder
    private func linksSection(_ vm: CompanyProfileViewModel, _ profile: CompanyProfile) -> some View {
        Section("Links") {
            if vm.isEditing {
                ForEach(vm.editLinks.indices, id: \.self) { index in
                    HStack {
                        TextField("Label", text: Binding(
                            get: { vm.editLinks[index].label },
                            set: { vm.editLinks[index].label = $0 }
                        ))
                        TextField("URL", text: Binding(
                            get: { vm.editLinks[index].url },
                            set: { vm.editLinks[index].url = $0 }
                        ))
                        .textContentType(.URL)
                        Button {
                            vm.editLinks.remove(at: index)
                        } label: {
                            Image(systemName: "minus.circle.fill")
                                .foregroundStyle(.red)
                        }
                    }
                }
                Button {
                    vm.editLinks.append((label: "", url: ""))
                } label: {
                    Label("Link hinzufügen", systemImage: "plus")
                }
            } else if profile.links.isEmpty {
                Text("Keine Links")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            } else {
                ForEach(profile.links) { link in
                    HStack {
                        Text(link.label)
                            .font(Theme.Typography.body)
                        Spacer()
                        Text(link.url)
                            .font(Theme.Typography.caption)
                            .foregroundStyle(Theme.Colors.primaryFallback)
                            .lineLimit(1)
                    }
                }
            }
        }
    }

    // MARK: - Details

    private func detailsSection(_ profile: CompanyProfile) -> some View {
        Section("Details") {
            DetailRow(label: "Kontaktperson", value: profile.contactPersonName)
            if let role = profile.contactPersonRole {
                DetailRow(label: "Position", value: role)
            }
            DetailRow(label: "Grösse", value: profile.companySize)
            if let website = profile.website {
                DetailRow(label: "Website", value: website)
            }
            if let address = profile.address {
                DetailRow(label: "Adresse", value: address)
            }
            DetailRow(label: "Standort", value: "\(profile.canton) \(profile.city)")
        }
    }

    // MARK: - Listings

    private func listingsSection(_ listings: [CompanyListing]) -> some View {
        Section("Aktive Lehrstellen (\(listings.count))") {
            ForEach(listings) { listing in
                CompanyListingRowView(listing: listing)
            }
        }
    }
}

// MARK: - Detail Row

private struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.textSecondary)
            Spacer()
            Text(value)
                .font(Theme.Typography.body)
        }
    }
}
