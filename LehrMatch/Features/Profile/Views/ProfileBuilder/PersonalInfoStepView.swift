import SwiftUI
import PhotosUI

struct PersonalInfoStepView: View {
    @Bindable var viewModel: ProfileBuilderViewModel

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            // Photo
            VStack(spacing: Theme.Spacing.sm) {
                PhotosPicker(selection: $viewModel.selectedPhoto, matching: .images) {
                    if let url = viewModel.profilePhotoUrl {
                        AvatarView(imageURL: URL(string: url), name: viewModel.firstName, size: 100)
                    } else {
                        ZStack {
                            Circle()
                                .fill(Theme.Colors.backgroundSecondary)
                                .frame(width: 100, height: 100)
                            Image(systemName: "camera.fill")
                                .font(.title2)
                                .foregroundStyle(Theme.Colors.textTertiary)
                        }
                    }
                }
                Text("Profilfoto hinzufügen")
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.primaryFallback)
            }
            .onChange(of: viewModel.selectedPhoto) { _, newValue in
                guard let item = newValue else { return }
                Task {
                    if let data = try? await item.loadTransferable(type: Data.self) {
                        await viewModel.uploadProfilePhoto(data)
                    }
                }
            }

            Group {
                formField("Vorname", text: $viewModel.firstName)
                formField("Nachname", text: $viewModel.lastName)

                DatePicker("Geburtsdatum", selection: $viewModel.dateOfBirth, displayedComponents: .date)
                    .datePickerStyle(.compact)

                Picker("Kanton", selection: $viewModel.canton) {
                    ForEach(Canton.allCases) { canton in
                        Text(canton.displayName).tag(canton)
                    }
                }

                formField("Stadt / Ort", text: $viewModel.city)

                // Home address for commute calculation
                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                    Text("Heimadresse")
                        .font(Theme.Typography.caption)
                        .foregroundStyle(Theme.Colors.textSecondary)
                    TextField("z.B. Bahnhofstrasse 1, 8001 Zürich", text: $viewModel.homeAddress)
                        .textFieldStyle(.roundedBorder)
                        .onSubmit {
                            Task { await viewModel.geocodeHomeAddress() }
                        }

                    switch viewModel.addressStatus {
                    case .none:
                        EmptyView()
                    case .geocoding:
                        HStack(spacing: Theme.Spacing.xs) {
                            ProgressView().scaleEffect(0.7)
                            Text("Adresse wird gesucht...")
                                .font(Theme.Typography.caption)
                                .foregroundStyle(Theme.Colors.textTertiary)
                        }
                    case .found:
                        Text("Adresse gfunde")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(.green)
                    case .notFound:
                        Text("Adresse nöd gfunde")
                            .font(Theme.Typography.caption)
                            .foregroundStyle(.red)
                    }

                    Text("Dini Adresse wird nur für d'Berechning vo de Reiseziit bruucht")
                        .font(.system(size: 11))
                        .foregroundStyle(Theme.Colors.textTertiary)
                }

                formField("Telefon", text: $viewModel.phone)
                    .keyboardType(.phonePad)
                formField("Nationalität", text: $viewModel.nationality)
            }
        }
    }

    private func formField(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            Text(label)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
            TextField(label, text: text)
                .textFieldStyle(.roundedBorder)
        }
    }
}
