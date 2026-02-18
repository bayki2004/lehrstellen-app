import SwiftUI
import AuthenticationServices

struct AuthView: View {
    @Environment(AppState.self) private var appState
    @State private var email = ""
    @State private var password = ""
    @State private var isSignUp = true
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            Spacer()

            Image(systemName: "flame.fill")
                .font(.system(size: 50))
                .foregroundStyle(Theme.Colors.primaryFallback.gradient)

            Text(isSignUp ? "Konto erstellen" : "Anmelden")
                .font(Theme.Typography.largeTitle)

            VStack(spacing: Theme.Spacing.md) {
                TextField("E-Mail", text: $email)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)

                SecureField("Passwort", text: $password)
                    .textFieldStyle(.roundedBorder)
                    .textContentType(.oneTimeCode)
            }
            .padding(.horizontal, Theme.Spacing.lg)

            if let error = errorMessage {
                Text(error)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(.red)
                    .padding(.horizontal)
            }

            PrimaryButton(
                title: isSignUp ? "Registrieren" : "Anmelden",
                action: { Task { await authenticate() } },
                isLoading: isLoading,
                isDisabled: email.isEmpty || password.count < 6
            )
            .padding(.horizontal, Theme.Spacing.lg)

            dividerWithText("oder")

            SignInWithAppleButton(.signIn) { request in
                request.requestedScopes = [.email]
            } onCompletion: { result in
                Task { await handleAppleSignIn(result) }
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 52)
            .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
            .padding(.horizontal, Theme.Spacing.lg)

            Spacer()

            #if DEBUG
            PrimaryButton(title: "Demo starten", action: {
                appState.currentStudent = .sample
                appState.hasCompletedOnboarding = true
                appState.isAuthenticated = true
            }, style: .outlined)
            .padding(.horizontal, Theme.Spacing.lg)
            #endif

            Button(isSignUp ? "Schon ein Konto? Anmelden" : "Neu hier? Registrieren") {
                withAnimation { isSignUp.toggle() }
            }
            .font(Theme.Typography.callout)
            .foregroundStyle(Theme.Colors.primaryFallback)
            .padding(.bottom, Theme.Spacing.xl)
        }
        .background(Theme.Colors.backgroundPrimary)
    }

    private func authenticate() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            if isSignUp {
                _ = try await appState.authManager.signUp(email: email, password: password, userType: appState.userType ?? .student)
            } else {
                _ = try await appState.authManager.signIn(email: email, password: password)
            }
            appState.isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            try await appState.authManager.handleAppleSignIn(result: result, userType: appState.userType ?? .student)
            appState.isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func dividerWithText(_ text: String) -> some View {
        HStack {
            Rectangle().frame(height: 1).foregroundStyle(Theme.Colors.textTertiary)
            Text(text)
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textSecondary)
            Rectangle().frame(height: 1).foregroundStyle(Theme.Colors.textTertiary)
        }
        .padding(.horizontal, Theme.Spacing.lg)
    }
}
