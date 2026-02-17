import SwiftUI

struct ProfileView: View {
    @Environment(AppState.self) private var appState
    @Environment(NavigationRouter.self) private var router
    @State private var profile: StudentProfile = .sample

    var body: some View {
        ScrollView {
            VStack(spacing: Theme.Spacing.lg) {
                // Profile header
                profileHeader

                // Stats
                statsSection

                // Quick links
                menuSection
            }
            .padding(.bottom, Theme.Spacing.xl)
        }
        .navigationTitle("Profil")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    router.navigate(to: .settings)
                } label: {
                    Image(systemName: "gearshape")
                }
            }
        }
    }

    private var profileHeader: some View {
        VStack(spacing: Theme.Spacing.md) {
            AvatarView(imageURL: profile.profilePhotoURL, name: profile.fullName, size: 100)

            Text(profile.fullName)
                .font(Theme.Typography.title)

            Text("\(profile.age) Jahre, \(profile.canton)")
                .font(Theme.Typography.callout)
                .foregroundStyle(Theme.Colors.textSecondary)

            Text(profile.schoolName)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)

            PrimaryButton(title: "Profil bearbeiten", action: {
                router.navigate(to: .editProfile)
            }, style: .outlined)
            .frame(width: 200)
        }
        .padding(.top, Theme.Spacing.lg)
    }

    private var statsSection: some View {
        HStack(spacing: Theme.Spacing.xl) {
            statItem(value: "\(profile.interests.count)", label: "Interessen")
            statItem(value: "\(profile.skills.count)", label: "Skills")
            statItem(value: "\(profile.schnupperlehreExperience.count)", label: "Schnupperlehren")
        }
        .padding(.horizontal, Theme.Spacing.lg)
    }

    private func statItem(value: String, label: String) -> some View {
        VStack(spacing: Theme.Spacing.xs) {
            Text(value)
                .font(Theme.Typography.title)
                .foregroundStyle(Theme.Colors.primaryFallback)
            Text(label)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
        }
        .frame(maxWidth: .infinity)
    }

    private var menuSection: some View {
        VStack(spacing: 0) {
            menuRow(icon: "brain.head.profile", title: "Persönlichkeitsprofil", color: .purple) {
                router.navigate(to: .personalityResults)
            }

            Divider().padding(.leading, 56)

            menuRow(icon: "briefcase", title: "Schnupperlehren", color: .orange) {
                // Navigate to Schnupperlehre list
            }

            Divider().padding(.leading, 56)

            menuRow(icon: "star", title: "Meine Skills", color: .blue) {
                router.navigate(to: .editProfile)
            }

            Divider().padding(.leading, 56)

            menuRow(icon: "gearshape", title: "Einstellungen", color: .gray) {
                router.navigate(to: .settings)
            }
        }
        .background(Theme.Colors.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
        .cardShadow()
        .padding(.horizontal, Theme.Spacing.lg)
    }

    private func menuRow(icon: String, title: String, color: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.md) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(color)
                    .frame(width: 32)

                Text(title)
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textPrimary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }
            .padding(.horizontal, Theme.Spacing.md)
            .padding(.vertical, Theme.Spacing.md)
        }
    }
}
