import SwiftUI
import AVFoundation

struct CameraRecorderView: UIViewControllerRepresentable {
    let maxDuration: TimeInterval
    let onRecordingComplete: (URL) -> Void
    let onCancel: () -> Void

    init(maxDuration: TimeInterval = 60, onRecordingComplete: @escaping (URL) -> Void, onCancel: @escaping () -> Void) {
        self.maxDuration = maxDuration
        self.onRecordingComplete = onRecordingComplete
        self.onCancel = onCancel
    }

    func makeUIViewController(context: Context) -> CameraRecorderViewController {
        let controller = CameraRecorderViewController()
        controller.maxDuration = maxDuration
        controller.onRecordingComplete = onRecordingComplete
        controller.onCancel = onCancel
        return controller
    }

    func updateUIViewController(_ uiViewController: CameraRecorderViewController, context: Context) {}
}

final class CameraRecorderViewController: UIViewController, AVCaptureFileOutputRecordingDelegate {
    var maxDuration: TimeInterval = 60
    var onRecordingComplete: ((URL) -> Void)?
    var onCancel: (() -> Void)?

    private let captureSession = AVCaptureSession()
    private let movieOutput = AVCaptureMovieFileOutput()
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var isRecording = false

    private let recordButton = UIButton(type: .system)
    private let cancelButton = UIButton(type: .system)
    private let timerLabel = UILabel()
    private var timer: Timer?
    private var elapsedSeconds: Int = 0

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        setupCamera()
        setupUI()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        captureSession.stopRunning()
        timer?.invalidate()
    }

    private func setupCamera() {
        captureSession.sessionPreset = .high

        // Front camera
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front),
              let videoInput = try? AVCaptureDeviceInput(device: camera) else { return }

        if captureSession.canAddInput(videoInput) {
            captureSession.addInput(videoInput)
        }

        // Microphone
        if let mic = AVCaptureDevice.default(for: .audio),
           let audioInput = try? AVCaptureDeviceInput(device: mic),
           captureSession.canAddInput(audioInput) {
            captureSession.addInput(audioInput)
        }

        // Output
        movieOutput.maxRecordedDuration = CMTime(seconds: maxDuration, preferredTimescale: 600)
        if captureSession.canAddOutput(movieOutput) {
            captureSession.addOutput(movieOutput)
        }

        // Preview
        let layer = AVCaptureVideoPreviewLayer(session: captureSession)
        layer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(layer)
        previewLayer = layer

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession.startRunning()
        }
    }

    private func setupUI() {
        // Timer label
        timerLabel.text = "0:00"
        timerLabel.textColor = .white
        timerLabel.font = .monospacedDigitSystemFont(ofSize: 18, weight: .medium)
        timerLabel.textAlignment = .center
        timerLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(timerLabel)

        // Record button
        recordButton.translatesAutoresizingMaskIntoConstraints = false
        recordButton.layer.cornerRadius = 36
        recordButton.layer.borderWidth = 4
        recordButton.layer.borderColor = UIColor.white.cgColor
        recordButton.backgroundColor = .systemRed
        recordButton.addTarget(self, action: #selector(toggleRecording), for: .touchUpInside)
        view.addSubview(recordButton)

        // Cancel button
        cancelButton.setTitle("Abbrechen", for: .normal)
        cancelButton.setTitleColor(.white, for: .normal)
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        view.addSubview(cancelButton)

        NSLayoutConstraint.activate([
            timerLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            timerLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),

            recordButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -40),
            recordButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            recordButton.widthAnchor.constraint(equalToConstant: 72),
            recordButton.heightAnchor.constraint(equalToConstant: 72),

            cancelButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -52),
            cancelButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 24),
        ])
    }

    @objc private func toggleRecording() {
        if isRecording {
            movieOutput.stopRecording()
            timer?.invalidate()
        } else {
            let outputURL = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString + ".mov")
            movieOutput.startRecording(to: outputURL, recordingDelegate: self)
            elapsedSeconds = 0
            timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
                guard let self else { return }
                self.elapsedSeconds += 1
                let minutes = self.elapsedSeconds / 60
                let seconds = self.elapsedSeconds % 60
                self.timerLabel.text = String(format: "%d:%02d", minutes, seconds)

                if Double(self.elapsedSeconds) >= self.maxDuration {
                    self.movieOutput.stopRecording()
                    self.timer?.invalidate()
                }
            }

            UIView.animate(withDuration: 0.2) {
                self.recordButton.layer.cornerRadius = 8
                self.recordButton.transform = CGAffineTransform(scaleX: 0.7, y: 0.7)
            }
        }
        isRecording.toggle()
    }

    @objc private func cancelTapped() {
        if isRecording {
            movieOutput.stopRecording()
            timer?.invalidate()
        }
        captureSession.stopRunning()
        onCancel?()
    }

    // MARK: - AVCaptureFileOutputRecordingDelegate

    func fileOutput(_ output: AVCaptureFileOutput, didFinishRecordingTo outputFileURL: URL, from connections: [AVCaptureConnection], error: Error?) {
        DispatchQueue.main.async { [weak self] in
            UIView.animate(withDuration: 0.2) {
                self?.recordButton.layer.cornerRadius = 36
                self?.recordButton.transform = .identity
            }
        }

        guard error == nil else { return }
        DispatchQueue.main.async { [weak self] in
            self?.onRecordingComplete?(outputFileURL)
        }
    }
}
