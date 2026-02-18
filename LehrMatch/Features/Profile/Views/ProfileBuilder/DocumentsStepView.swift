import SwiftUI
import UniformTypeIdentifiers

struct DocumentsStepView: View {
    @Bindable var viewModel: ProfileBuilderViewModel
    @State private var showDocumentPicker = false

    var body: some View {
        VStack(spacing: Theme.Spacing.lg) {
            VStack(spacing: Theme.Spacing.sm) {
                Image(systemName: "doc.on.doc.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(Theme.Colors.primaryFallback)

                Text("Zeugnisse & Dokumente")
                    .font(Theme.Typography.title)

                Text("Lade deine Schulzeugnisse, Zertifikate oder andere relevante Dokumente hoch.")
                    .font(Theme.Typography.body)
                    .foregroundStyle(Theme.Colors.textSecondary)
                    .multilineTextAlignment(.center)
            }

            // Document list
            ForEach(viewModel.zeugnisse) { zeugnis in
                documentCard(zeugnis)
            }

            // Upload button
            Button {
                showDocumentPicker = true
            } label: {
                HStack {
                    Image(systemName: "plus.circle.fill")
                    Text("Dokument hochladen")
                }
                .font(Theme.Typography.body)
                .foregroundStyle(Theme.Colors.primaryFallback)
                .frame(maxWidth: .infinity)
                .padding(Theme.Spacing.md)
                .background(Theme.Colors.primaryFallback.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: Theme.CornerRadius.medium))
            }

            if viewModel.isLoading {
                ProgressView("Wird hochgeladen...")
            }

            Text("Erlaubte Formate: PDF, JPEG, PNG (max. 10 MB)")
                .font(Theme.Typography.caption)
                .foregroundStyle(Theme.Colors.textTertiary)
        }
        .sheet(isPresented: $showDocumentPicker) {
            DocumentPickerView { urls in
                guard let url = urls.first else { return }
                let fileType = url.pathExtension.lowercased() == "pdf" ? "pdf" : "image"
                Task {
                    if let data = try? Data(contentsOf: url) {
                        await viewModel.uploadZeugnis(
                            data: data,
                            fileName: url.lastPathComponent,
                            fileType: fileType
                        )
                    }
                }
            }
        }
    }

    private func documentCard(_ zeugnis: Zeugnis) -> some View {
        HStack(spacing: Theme.Spacing.md) {
            Image(systemName: zeugnis.isPDF ? "doc.fill" : "photo.fill")
                .font(.title2)
                .foregroundStyle(zeugnis.isPDF ? .red : Theme.Colors.primaryFallback)
                .frame(width: 40)

            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                Text(zeugnis.fileName)
                    .font(Theme.Typography.body)
                    .lineLimit(1)
                Text(zeugnis.formattedSize)
                    .font(Theme.Typography.caption)
                    .foregroundStyle(Theme.Colors.textTertiary)
            }

            Spacer()

            Button {
                viewModel.removeZeugnis(zeugnis)
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
}

// MARK: - Document Picker

struct DocumentPickerView: UIViewControllerRepresentable {
    let onPick: ([URL]) -> Void

    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let types: [UTType] = [.pdf, .jpeg, .png]
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: types)
        picker.delegate = context.coordinator
        picker.allowsMultipleSelection = false
        return picker
    }

    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onPick: onPick)
    }

    class Coordinator: NSObject, UIDocumentPickerDelegate {
        let onPick: ([URL]) -> Void
        init(onPick: @escaping ([URL]) -> Void) { self.onPick = onPick }

        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            for url in urls { _ = url.startAccessingSecurityScopedResource() }
            onPick(urls)
            for url in urls { url.stopAccessingSecurityScopedResource() }
        }
    }
}
