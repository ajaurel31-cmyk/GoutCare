import SwiftUI
import PhotosUI

struct ScannerView: View {
    @EnvironmentObject var store: DataStore
    @State private var selectedImage: UIImage?
    @State private var showCamera = false
    @State private var showPhotoPicker = false
    @State private var isAnalyzing = false
    @State private var result: ScanResult?
    @State private var errorMessage: String?
    @State private var saved = false

    private var canScan: Bool {
        store.isSubscribed || store.getScanCount() < Constants.freeScanLimit
    }

    private var scansRemaining: Int {
        max(0, Constants.freeScanLimit - store.getScanCount())
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 4) {
                    Text("Food Scanner")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(GC.text)
                    Text("AI-powered purine analysis")
                        .font(.system(size: 14))
                        .foregroundColor(GC.textSecondary)
                    if !store.isSubscribed {
                        Text("\(scansRemaining) free scans left today")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(GC.warning)
                            .padding(.top, 4)
                    }
                }

                if let image = selectedImage {
                    // Image preview
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 220)
                        .clipped()
                        .cornerRadius(16)

                    if isAnalyzing {
                        VStack(spacing: 12) {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: GC.accent))
                                .scaleEffect(1.2)
                            Text("Analyzing your food...")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(GC.textSecondary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(32)
                        .card()
                    } else if let result = result {
                        ResultView(result: result, saved: $saved, onSave: saveResult, onScanAgain: reset)
                    } else if let error = errorMessage {
                        VStack(spacing: 12) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .font(.system(size: 32))
                                .foregroundColor(GC.danger)
                            Text(error)
                                .font(.system(size: 15))
                                .foregroundColor(GC.textSecondary)
                                .multilineTextAlignment(.center)
                            HStack(spacing: 12) {
                                Button("Retake") { reset() }
                                    .buttonStyle(SecondaryButtonStyle())
                                Button("Try Again") { analyze() }
                                    .buttonStyle(PrimaryButtonStyle())
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(24)
                        .card()
                    } else {
                        HStack(spacing: 12) {
                            Button("Analyze") { analyze() }
                                .buttonStyle(PrimaryButtonStyle())
                            Button("Retake") { reset() }
                                .buttonStyle(SecondaryButtonStyle())
                        }
                    }
                } else {
                    // Capture buttons
                    VStack(spacing: 12) {
                        Button {
                            showCamera = true
                        } label: {
                            HStack(spacing: 10) {
                                Image(systemName: "camera.fill").font(.system(size: 20))
                                Text("Take Photo").font(.system(size: 16, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(GC.accent)
                            .cornerRadius(14)
                        }

                        Button {
                            showPhotoPicker = true
                        } label: {
                            HStack(spacing: 10) {
                                Image(systemName: "photo.on.rectangle").font(.system(size: 20))
                                Text("Choose from Library").font(.system(size: 16, weight: .semibold))
                            }
                            .foregroundColor(GC.accent)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 18)
                            .background(Color.clear)
                            .cornerRadius(14)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(GC.accent, lineWidth: 1.5))
                        }
                    }

                    // How it works
                    VStack(alignment: .leading, spacing: 16) {
                        Text("How it works")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(GC.text)

                        HowItWorksRow(num: "1", text: "Take a photo of your food")
                        HowItWorksRow(num: "2", text: "AI identifies all food items")
                        HowItWorksRow(num: "3", text: "Get purine level & safer alternatives")
                    }
                    .card()
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 32)
        }
        .background(GC.bg.ignoresSafeArea())
        .fullScreenCover(isPresented: $showCamera) {
            CameraView(image: $selectedImage)
                .ignoresSafeArea()
        }
        .sheet(isPresented: $showPhotoPicker) {
            PhotoPickerView(image: $selectedImage)
        }
    }

    private func analyze() {
        guard canScan else {
            errorMessage = "You've used all 3 free scans today. Upgrade to scan unlimited foods."
            return
        }
        guard let image = selectedImage else { return }
        isAnalyzing = true
        errorMessage = nil
        result = nil

        Task {
            do {
                let res = try await APIService.shared.analyzeFood(image: image, goutStage: store.profile.goutStage)
                await MainActor.run {
                    self.result = res
                    self.isAnalyzing = false
                    store.incrementScanCount()
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = error.localizedDescription
                    self.isAnalyzing = false
                }
            }
        }
    }

    private func saveResult() {
        guard let result = result else { return }
        let entry = FoodEntry(
            name: result.foods.joined(separator: ", "),
            servingSize: "1 serving",
            purineContent: result.estimatedPurine
        )
        store.addFoodEntry(entry)
        saved = true
    }

    private func reset() {
        selectedImage = nil
        result = nil
        errorMessage = nil
        saved = false
    }
}

// MARK: - Result View
struct ResultView: View {
    let result: ScanResult
    @Binding var saved: Bool
    let onSave: () -> Void
    let onScanAgain: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Foods identified
            HStack {
                Text(result.foods.joined(separator: ", "))
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(GC.text)
                Spacer()
                PurineBadge(level: result.purineLevel, mg: result.estimatedPurine)
            }

            // Level badge
            HStack {
                Text(result.purineLevel.label)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(GC.purineColor(result.purineLevel))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(GC.purineColorLight(result.purineLevel))
                    .cornerRadius(20)
                Text("~\(result.estimatedPurine) mg purines")
                    .font(.system(size: 13))
                    .foregroundColor(GC.textSecondary)
            }

            // Explanation
            Text(result.explanation)
                .font(.system(size: 14))
                .foregroundColor(GC.textSecondary)
                .lineSpacing(3)

            // Risk factors
            if !result.riskFactors.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Risk Factors").font(.system(size: 13, weight: .bold)).foregroundColor(GC.danger)
                    ForEach(result.riskFactors, id: \.self) { factor in
                        HStack(spacing: 6) {
                            Image(systemName: "exclamationmark.triangle.fill").font(.system(size: 11)).foregroundColor(GC.danger)
                            Text(factor).font(.system(size: 13)).foregroundColor(GC.textSecondary)
                        }
                    }
                }
            }

            // Benefits
            if !result.benefits.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Benefits").font(.system(size: 13, weight: .bold)).foregroundColor(GC.success)
                    ForEach(result.benefits, id: \.self) { benefit in
                        HStack(spacing: 6) {
                            Image(systemName: "checkmark.circle.fill").font(.system(size: 11)).foregroundColor(GC.success)
                            Text(benefit).font(.system(size: 13)).foregroundColor(GC.textSecondary)
                        }
                    }
                }
            }

            // Flare safety
            Text("During Flare: ").font(.system(size: 13, weight: .bold)).foregroundColor(GC.orange) +
            Text(result.safetyDuringFlare).font(.system(size: 13)).foregroundColor(GC.textSecondary)

            // Alternatives
            if !result.alternatives.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Safer Alternatives").font(.system(size: 13, weight: .bold)).foregroundColor(GC.accent)
                    FlowLayout(spacing: 6) {
                        ForEach(result.alternatives, id: \.self) { alt in
                            Text(alt)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(GC.accent)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(GC.accentLight)
                                .cornerRadius(20)
                        }
                    }
                }
            }

            // Save button
            if saved {
                HStack {
                    Image(systemName: "checkmark.circle.fill").foregroundColor(GC.success)
                    Text("Saved to today's log").foregroundColor(GC.success)
                }
                .font(.system(size: 14, weight: .semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(GC.successLight)
                .cornerRadius(12)
            } else {
                Button("Save to Food Log", action: onSave)
                    .buttonStyle(PrimaryButtonStyle())
            }

            Button("Scan Again", action: onScanAgain)
                .buttonStyle(SecondaryButtonStyle())
        }
        .card()
    }
}

// MARK: - How It Works Row
struct HowItWorksRow: View {
    let num: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Text(num)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .frame(width: 28, height: 28)
                .background(GC.accent)
                .clipShape(Circle())
            Text(text)
                .font(.system(size: 14))
                .foregroundColor(GC.textSecondary)
        }
    }
}

// MARK: - Camera View (UIKit wrapper)
struct CameraView: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraView
        init(_ parent: CameraView) { self.parent = parent }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            parent.image = info[.originalImage] as? UIImage
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

// MARK: - Photo Picker View
struct PhotoPickerView: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) var dismiss

    func makeUIViewController(context: Context) -> PHPickerViewController {
        var config = PHPickerConfiguration()
        config.filter = .images
        config.selectionLimit = 1
        let picker = PHPickerViewController(configuration: config)
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let parent: PhotoPickerView
        init(_ parent: PhotoPickerView) { self.parent = parent }

        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            parent.dismiss()
            guard let result = results.first else { return }
            result.itemProvider.loadObject(ofClass: UIImage.self) { obj, _ in
                DispatchQueue.main.async { self.parent.image = obj as? UIImage }
            }
        }
    }
}
