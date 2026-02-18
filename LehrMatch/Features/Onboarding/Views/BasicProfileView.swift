import SwiftUI
import PhotosUI

struct BasicProfileView: View {
    @Bindable var viewModel: OnboardingViewModel
    @State private var selectedPhoto: PhotosPickerItem?
    @State private var profileImage: Image?

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                Text("Erzähl uns von dir")
                    .font(Theme.Typography.largeTitle)
                    .padding(.top, Theme.Spacing.lg)

                // Profile Photo
                PhotosPicker(selection: $selectedPhoto, matching: .images) {
                    ZStack {
                        if let profileImage {
                            profileImage
                                .resizable()
                                .scaledToFill()
                                .frame(width: 100, height: 100)
                                .clipShape(Circle())
                        } else {
                            Circle()
                                .fill(Theme.Colors.backgroundSecondary)
                                .frame(width: 100, height: 100)
                                .overlay {
                                    Image(systemName: "camera.fill")
                                        .font(.title2)
                                        .foregroundStyle(Theme.Colors.textSecondary)
                                }
                        }

                        Circle()
                            .stroke(Theme.Colors.primaryFallback, lineWidth: 3)
                            .frame(width: 104, height: 104)
                    }
                }
                .onChange(of: selectedPhoto) { _, newItem in
                    Task {
                        if let data = try? await newItem?.loadTransferable(type: Data.self),
                           let uiImage = UIImage(data: data) {
                            profileImage = Image(uiImage: uiImage)
                        }
                    }
                }

                Text("Profilfoto (optional)")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textSecondary)

                // Form fields
                VStack(spacing: Theme.Spacing.md) {
                    FormField(label: "Vorname") {
                        TextField("Max", text: $viewModel.firstName)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.givenName)
                    }

                    FormField(label: "Nachname") {
                        TextField("Muster", text: $viewModel.lastName)
                            .textFieldStyle(.roundedBorder)
                            .textContentType(.familyName)
                    }

                    FormField(label: "Kanton") {
                        Picker("Kanton", selection: $viewModel.canton) {
                            ForEach(Canton.allCases) { canton in
                                Text(canton.displayName).tag(canton)
                            }
                        }
                        .pickerStyle(.menu)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    FormField(label: "Schule") {
                        TextField("Sekundarschule Muster", text: $viewModel.schoolName)
                            .textFieldStyle(.roundedBorder)
                    }

                    FormField(label: "Schuljahr") {
                        Picker("Schuljahr", selection: $viewModel.schoolYear) {
                            ForEach(SchoolYear.allCases, id: \.self) { year in
                                Text(year.rawValue).tag(year)
                            }
                        }
                        .pickerStyle(.segmented)
                    }
                }
                .padding(.horizontal, Theme.Spacing.lg)

                PrimaryButton(
                    title: "Weiter zum Persönlichkeitsquiz",
                    action: { Task { await viewModel.saveBasicProfile() } },
                    isLoading: viewModel.isLoading,
                    isDisabled: viewModel.firstName.isEmpty || viewModel.lastName.isEmpty
                )
                .padding(.horizontal, Theme.Spacing.lg)
                .padding(.bottom, Theme.Spacing.xl)
            }
        }
        .background(Theme.Colors.backgroundPrimary)
    }
}

struct FormField<Content: View>: View {
    let label: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text(label)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
            content()
        }
    }
}
