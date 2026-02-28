import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var store: DataStore
    @State private var showMedModal = false
    @State private var showClearConfirm = false
    @State private var showExportShare = false
    @State private var exportData: Data?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("Settings")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(GC.text)
                    .frame(maxWidth: .infinity, alignment: .leading)

                // Subscription
                VStack(alignment: .leading, spacing: 8) {
                    SectionLabel(text: "Subscription")
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(planLabel)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(GC.text)
                            if store.subscription.isTrial {
                                Text("\(store.trialDaysRemaining) days remaining")
                                    .font(.system(size: 13))
                                    .foregroundColor(GC.textSecondary)
                            }
                        }
                        Spacer()
                        Text(store.subscription.plan.uppercased())
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(GC.accent)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(GC.accentLight)
                            .cornerRadius(20)
                    }
                    .card()
                }

                // Daily Goals
                VStack(alignment: .leading, spacing: 12) {
                    SectionLabel(text: "Daily Goals")

                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Purine Limit")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(GC.text)
                            Spacer()
                            Text("\(store.profile.purineTarget) mg")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(GC.accent)
                        }
                        Slider(value: Binding(
                            get: { Double(store.profile.purineTarget) },
                            set: { val in store.updateProfile { $0.purineTarget = Int(val) } }
                        ), in: 200...600, step: 25)
                        .tint(GC.accent)
                    }
                    .card()

                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Water Goal")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(GC.text)
                            Spacer()
                            Text("\(store.profile.waterGoal) oz")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(GC.cyan)
                        }
                        Slider(value: Binding(
                            get: { Double(store.profile.waterGoal) },
                            set: { val in store.updateProfile { $0.waterGoal = Int(val) } }
                        ), in: 32...128, step: 8)
                        .tint(GC.cyan)
                    }
                    .card()
                }

                // Gout Stage
                VStack(alignment: .leading, spacing: 12) {
                    SectionLabel(text: "Gout Stage")
                    ForEach(GoutStage.allCases, id: \.self) { stage in
                        Button {
                            store.updateProfile { $0.goutStage = stage }
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(stage.label)
                                        .font(.system(size: 15, weight: .semibold))
                                        .foregroundColor(GC.text)
                                    Text(stage.desc)
                                        .font(.system(size: 12))
                                        .foregroundColor(GC.textTertiary)
                                }
                                Spacer()
                                if store.profile.goutStage == stage {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(GC.accent)
                                }
                            }
                            .padding(14)
                            .background(store.profile.goutStage == stage ? GC.accentLight : GC.bgCard)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(store.profile.goutStage == stage ? GC.accent.opacity(0.3) : GC.border, lineWidth: 1))
                        }
                    }
                }

                // Medications
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        SectionLabel(text: "Medications")
                        Spacer()
                        Button { showMedModal = true } label: {
                            Image(systemName: "plus.circle.fill")
                                .font(.system(size: 20))
                                .foregroundColor(GC.accent)
                        }
                    }

                    if store.medications.isEmpty {
                        Text("No medications added")
                            .font(.system(size: 14))
                            .foregroundColor(GC.textTertiary)
                            .padding(.vertical, 12)
                    } else {
                        ForEach(store.medications) { med in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(med.name)
                                        .font(.system(size: 15, weight: .semibold))
                                        .foregroundColor(GC.text)
                                    Text(med.dosage)
                                        .font(.system(size: 12))
                                        .foregroundColor(GC.textTertiary)
                                    // Show interactions if any
                                    if let interaction = drugInteractions.first(where: { $0.medication.lowercased() == med.name.lowercased() }) {
                                        ForEach(interaction.interactions, id: \.self) { warning in
                                            HStack(spacing: 4) {
                                                Image(systemName: "exclamationmark.triangle.fill")
                                                    .font(.system(size: 10))
                                                    .foregroundColor(GC.warning)
                                                Text(warning)
                                                    .font(.system(size: 11))
                                                    .foregroundColor(GC.warning)
                                            }
                                        }
                                    }
                                }
                                Spacer()
                                Button { store.deleteMedication(med.id) } label: {
                                    Image(systemName: "trash")
                                        .font(.system(size: 14))
                                        .foregroundColor(GC.textTertiary)
                                }
                            }
                            .card()
                        }
                    }
                }

                // Data Management
                VStack(alignment: .leading, spacing: 12) {
                    SectionLabel(text: "Data")

                    Button {
                        exportData = store.exportAllData()
                        showExportShare = true
                    } label: {
                        HStack {
                            Image(systemName: "square.and.arrow.up").foregroundColor(GC.accent)
                            Text("Export All Data").foregroundColor(GC.text)
                            Spacer()
                            Image(systemName: "chevron.right").foregroundColor(GC.textTertiary)
                        }
                        .font(.system(size: 15, weight: .medium))
                        .padding(14)
                        .background(GC.bgCard)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
                    }

                    Button { showClearConfirm = true } label: {
                        HStack {
                            Image(systemName: "trash").foregroundColor(GC.danger)
                            Text("Clear All Data").foregroundColor(GC.danger)
                            Spacer()
                            Image(systemName: "chevron.right").foregroundColor(GC.textTertiary)
                        }
                        .font(.system(size: 15, weight: .medium))
                        .padding(14)
                        .background(GC.bgCard)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
                    }
                }

                // About
                VStack(alignment: .leading, spacing: 8) {
                    SectionLabel(text: "About")
                    VStack(alignment: .leading, spacing: 4) {
                        Text("GoutCare")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(GC.text)
                        Text("Version 1.0")
                            .font(.system(size: 13))
                            .foregroundColor(GC.textSecondary)
                        Text("Your personal gout management companion. Track purine intake, scan foods, monitor uric acid levels, and manage flares.")
                            .font(.system(size: 13))
                            .foregroundColor(GC.textTertiary)
                            .padding(.top, 4)
                    }
                    .card()
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 32)
        }
        .background(GC.bg.ignoresSafeArea())
        .sheet(isPresented: $showMedModal) { AddMedicationSheet() }
        .alert("Clear All Data?", isPresented: $showClearConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Clear", role: .destructive) { store.clearAllData() }
        } message: {
            Text("This will permanently delete all your data. This cannot be undone.")
        }
        .sheet(isPresented: $showExportShare) {
            if let data = exportData {
                ShareSheet(data: data)
            }
        }
    }

    private var planLabel: String {
        switch store.subscription.plan {
        case "trial": return "Free Trial"
        case "monthly": return "Monthly Premium"
        case "annual": return "Annual Premium"
        default: return "Free Plan"
        }
    }
}

// MARK: - Section Label
struct SectionLabel: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 13, weight: .bold))
            .foregroundColor(GC.accent)
            .textCase(.uppercase)
    }
}

// MARK: - Add Medication Sheet
struct AddMedicationSheet: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var dosage = ""

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                // Preset buttons
                VStack(alignment: .leading, spacing: 8) {
                    Text("Common Medications")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(GC.textSecondary)
                    FlowLayout(spacing: 8) {
                        ForEach(medicationPresets, id: \.self) { preset in
                            Button {
                                name = preset
                            } label: {
                                Text(preset)
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(name == preset ? .white : GC.purple)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(name == preset ? GC.purple : GC.purple.opacity(0.12))
                                    .cornerRadius(20)
                            }
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Medication Name").font(.system(size: 13, weight: .semibold)).foregroundColor(GC.textSecondary)
                    TextField("Name", text: $name)
                        .padding(12)
                        .background(GC.bgInput)
                        .cornerRadius(10)
                        .foregroundColor(GC.text)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Dosage").font(.system(size: 13, weight: .semibold)).foregroundColor(GC.textSecondary)
                    TextField("e.g. 300mg daily", text: $dosage)
                        .padding(12)
                        .background(GC.bgInput)
                        .cornerRadius(10)
                        .foregroundColor(GC.text)
                }

                Button("Add Medication") {
                    guard !name.isEmpty else { return }
                    store.addMedication(Medication(name: name, dosage: dosage))
                    dismiss()
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(name.isEmpty)

                Spacer()
            }
            .padding()
            .background(GC.bg.ignoresSafeArea())
            .navigationTitle("Add Medication")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }.foregroundColor(GC.accent)
                }
            }
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
        .presentationDetents([.large])
    }
}

// MARK: - Share Sheet
struct ShareSheet: UIViewControllerRepresentable {
    let data: Data

    func makeUIViewController(context: Context) -> UIActivityViewController {
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("goutcare_export.json")
        try? data.write(to: tempURL)
        return UIActivityViewController(activityItems: [tempURL], applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
