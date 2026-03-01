import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var store: DataStore
    @State private var showMedModal = false
    @State private var showClearConfirm = false
    @State private var isExporting = false
    @State private var showPrivacy = false
    @State private var showTerms = false
    @State private var showEULA = false
    @State private var selectedTheme: AppTheme = .dark

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

                    VStack(spacing: 0) {
                        // Plan info
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(planLabel)
                                    .font(.system(size: 16, weight: .bold))
                                    .foregroundColor(GC.text)
                                if store.isTrialActive {
                                    Text("\(store.trialDaysRemaining) days remaining")
                                        .font(.system(size: 13))
                                        .foregroundColor(GC.textSecondary)
                                } else if let expDate = store.subscriptionExpirationDate {
                                    Text("Renews \(expDate)")
                                        .font(.system(size: 13))
                                        .foregroundColor(GC.textSecondary)
                                }
                            }
                            Spacer()
                            Text(store.storeManager.subscriptionStatusText.uppercased())
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(subscriptionBadgeColor)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(subscriptionBadgeColor.opacity(0.12))
                                .cornerRadius(20)
                        }
                        .padding(14)

                        // Grace period / billing issue warning
                        if store.storeManager.isInGracePeriod || store.storeManager.isInBillingRetry {
                            Divider().background(GC.border)
                            HStack(spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(GC.warning)
                                Text("There's a billing issue with your subscription. Please update your payment method to avoid losing access.")
                                    .font(.system(size: 12))
                                    .foregroundColor(GC.textSecondary)
                            }
                            .padding(14)
                        }

                        // Manage subscription button
                        if store.hasPaidSubscription {
                            Divider().background(GC.border)
                            Button {
                                Task { await store.manageSubscription() }
                            } label: {
                                HStack {
                                    Text("Manage Subscription")
                                        .font(.system(size: 15, weight: .medium))
                                        .foregroundColor(GC.accent)
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .font(.system(size: 12, weight: .semibold))
                                        .foregroundColor(GC.textTertiary)
                                }
                                .padding(14)
                            }
                        }
                    }
                    .background(GC.bgCard)
                    .cornerRadius(14)
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(GC.border, lineWidth: 1))
                }

                // Appearance
                VStack(alignment: .leading, spacing: 12) {
                    SectionLabel(text: "Appearance")
                    VStack(spacing: 0) {
                        ForEach(Array(AppTheme.allCases.enumerated()), id: \.element) { index, theme in
                            Button {
                                selectedTheme = theme
                                store.updateProfile { $0.theme = theme.rawValue }
                            } label: {
                                HStack {
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(themePreviewColor(theme))
                                        .frame(width: 32, height: 32)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 6)
                                                .stroke(GC.borderStrong, lineWidth: 1.5)
                                        )
                                    Text(theme.label)
                                        .font(.system(size: 15, weight: .medium))
                                        .foregroundColor(GC.text)
                                    Spacer()
                                    if selectedTheme == theme {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(GC.accent)
                                    }
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                                .background(GC.bgCard)
                            }
                            if index < AppTheme.allCases.count - 1 {
                                Divider().background(GC.border)
                            }
                        }
                    }
                    .cornerRadius(16)
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(GC.border, lineWidth: 1))
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

                // Reminders
                remindersSection

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
                        guard !isExporting else { return }
                        isExporting = true
                        Task {
                            let pdfData = store.exportPDFReport()
                            let url = FileManager.default.temporaryDirectory.appendingPathComponent("GoutCare-Report-\(Date().dateKey).pdf")
                            try? pdfData.write(to: url)
                            isExporting = false
                            presentShareSheet(url: url)
                        }
                    } label: {
                        HStack {
                            Image(systemName: "doc.text").foregroundColor(GC.accent)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Export Health Report").foregroundColor(GC.text)
                                Text("PDF report to share with your doctor")
                                    .font(.system(size: 12))
                                    .foregroundColor(GC.textTertiary)
                            }
                            Spacer()
                            if isExporting {
                                ProgressView().tint(GC.accent)
                            } else {
                                Image(systemName: "chevron.right").foregroundColor(GC.textTertiary)
                            }
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
                        Text("AI-powered gout management. Track purines, scan foods, monitor uric acid, and manage flares.")
                            .font(.system(size: 13))
                            .foregroundColor(GC.textTertiary)
                            .padding(.top, 4)

                        HStack(spacing: 16) {
                            Button { showTerms = true } label: {
                                Text("Terms of Service")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(GC.accent)
                                    .underline()
                            }
                            Button { showPrivacy = true } label: {
                                Text("Privacy Policy")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(GC.accent)
                                    .underline()
                            }
                            Button { showEULA = true } label: {
                                Text("EULA")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(GC.accent)
                                    .underline()
                            }
                        }
                        .padding(.top, 8)
                    }
                    .card()
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 32)
        }
        .background(GC.bg.ignoresSafeArea())
        .onAppear {
            selectedTheme = AppTheme(rawValue: store.profile.theme) ?? .dark
        }
        .sheet(isPresented: $showMedModal) { AddMedicationSheet() }
        .sheet(isPresented: $showPrivacy) { PrivacyPolicyView() }
        .sheet(isPresented: $showTerms) { TermsOfServiceView() }
        .sheet(isPresented: $showEULA) { EULAView() }
        .alert("Clear All Data?", isPresented: $showClearConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Clear", role: .destructive) { store.clearAllData() }
        } message: {
            Text("This will permanently delete all your data. This cannot be undone.")
        }
    }

    // MARK: - Reminders Section

    private var remindersSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionLabel(text: "Reminders")

            // Water Reminders
            VStack(spacing: 0) {
                reminderToggleRow(
                    icon: "drop.fill",
                    iconColor: GC.cyan,
                    iconBg: GC.cyanLight,
                    title: "Water Reminders",
                    subtitle: "Stay hydrated throughout the day",
                    isOn: store.reminderSettings.waterEnabled
                ) { enabled in
                    toggleReminder(keyPath: \.waterEnabled, enabled: enabled)
                }

                if store.reminderSettings.waterEnabled {
                    Divider().background(GC.border)
                    VStack(spacing: 12) {
                        HStack {
                            Text("Every")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(GC.textSecondary)
                            Spacer()
                            Picker("Interval", selection: Binding(
                                get: { store.reminderSettings.waterIntervalHours },
                                set: { val in store.updateReminders { $0.waterIntervalHours = val } }
                            )) {
                                Text("1 hour").tag(1)
                                Text("2 hours").tag(2)
                                Text("3 hours").tag(3)
                                Text("4 hours").tag(4)
                            }
                            .pickerStyle(.menu)
                            .tint(GC.accent)
                        }
                        reminderTimeRow(label: "From", time: Binding(
                            get: { timeFromString(store.reminderSettings.waterStartTime) },
                            set: { val in store.updateReminders { $0.waterStartTime = stringFromTime(val) } }
                        ))
                        reminderTimeRow(label: "Until", time: Binding(
                            get: { timeFromString(store.reminderSettings.waterEndTime) },
                            set: { val in store.updateReminders { $0.waterEndTime = stringFromTime(val) } }
                        ))
                    }
                    .padding(16)
                }
            }
            .background(GC.bgCard)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(GC.border, lineWidth: 1))

            // Meal Reminders
            VStack(spacing: 0) {
                reminderToggleRow(
                    icon: "fork.knife",
                    iconColor: GC.warning,
                    iconBg: GC.warningLight,
                    title: "Meal Log Reminders",
                    subtitle: "Log purine intake at mealtimes",
                    isOn: store.reminderSettings.mealsEnabled
                ) { enabled in
                    toggleReminder(keyPath: \.mealsEnabled, enabled: enabled)
                }

                if store.reminderSettings.mealsEnabled {
                    Divider().background(GC.border)
                    VStack(spacing: 12) {
                        reminderTimeRow(label: "Breakfast", time: Binding(
                            get: { timeFromString(store.reminderSettings.breakfastTime) },
                            set: { val in store.updateReminders { $0.breakfastTime = stringFromTime(val) } }
                        ))
                        reminderTimeRow(label: "Lunch", time: Binding(
                            get: { timeFromString(store.reminderSettings.lunchTime) },
                            set: { val in store.updateReminders { $0.lunchTime = stringFromTime(val) } }
                        ))
                        reminderTimeRow(label: "Dinner", time: Binding(
                            get: { timeFromString(store.reminderSettings.dinnerTime) },
                            set: { val in store.updateReminders { $0.dinnerTime = stringFromTime(val) } }
                        ))
                    }
                    .padding(16)
                }
            }
            .background(GC.bgCard)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(GC.border, lineWidth: 1))

            // Medication Reminders
            VStack(spacing: 0) {
                reminderToggleRow(
                    icon: "pills.fill",
                    iconColor: GC.purple,
                    iconBg: GC.purple.opacity(0.12),
                    title: "Medication Reminders",
                    subtitle: "Never miss a dose",
                    isOn: store.reminderSettings.medicationEnabled
                ) { enabled in
                    toggleReminder(keyPath: \.medicationEnabled, enabled: enabled)
                }

                if store.reminderSettings.medicationEnabled {
                    Divider().background(GC.border)
                    VStack(spacing: 10) {
                        ForEach(Array(store.reminderSettings.medicationTimes.enumerated()), id: \.offset) { i, time in
                            HStack {
                                Text("Dose \(i + 1)")
                                    .font(.system(size: 13, weight: .medium))
                                    .foregroundColor(GC.textSecondary)
                                Spacer()
                                DatePicker("", selection: Binding(
                                    get: { timeFromString(time) },
                                    set: { val in store.updateReminders { $0.medicationTimes[i] = stringFromTime(val) } }
                                ), displayedComponents: .hourAndMinute)
                                .labelsHidden()
                                .tint(GC.accent)

                                if store.reminderSettings.medicationTimes.count > 1 {
                                    Button {
                                        store.updateReminders { s in
                                            s.medicationTimes.remove(at: i)
                                        }
                                    } label: {
                                        Image(systemName: "xmark.circle.fill")
                                            .font(.system(size: 16))
                                            .foregroundColor(GC.textTertiary.opacity(0.5))
                                    }
                                }
                            }
                        }

                        if store.reminderSettings.medicationTimes.count < 6 {
                            Button {
                                store.updateReminders { $0.medicationTimes.append("09:00") }
                            } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: "plus")
                                        .font(.system(size: 12, weight: .bold))
                                    Text("Add another time")
                                        .font(.system(size: 13, weight: .semibold))
                                }
                                .foregroundColor(GC.accent)
                            }
                            .padding(.top, 4)
                        }
                    }
                    .padding(16)
                }
            }
            .background(GC.bgCard)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(GC.border, lineWidth: 1))

            // Uric Acid Check
            VStack(spacing: 0) {
                reminderToggleRow(
                    icon: "bell.fill",
                    iconColor: GC.accent,
                    iconBg: GC.accentLight,
                    title: "Uric Acid Check",
                    subtitle: "Periodic testing reminders",
                    isOn: store.reminderSettings.uricAcidEnabled
                ) { enabled in
                    toggleReminder(keyPath: \.uricAcidEnabled, enabled: enabled)
                }

                if store.reminderSettings.uricAcidEnabled {
                    Divider().background(GC.border)
                    VStack(spacing: 12) {
                        HStack {
                            Text("Frequency")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(GC.textSecondary)
                            Spacer()
                            Picker("Frequency", selection: Binding(
                                get: { store.reminderSettings.uricAcidFrequency },
                                set: { val in store.updateReminders { $0.uricAcidFrequency = val } }
                            )) {
                                Text("Weekly").tag("weekly")
                                Text("Monthly").tag("monthly")
                            }
                            .pickerStyle(.menu)
                            .tint(GC.accent)
                        }

                        HStack {
                            Text(store.reminderSettings.uricAcidFrequency == "weekly" ? "Day" : "Day of month")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(GC.textSecondary)
                            Spacer()
                            if store.reminderSettings.uricAcidFrequency == "weekly" {
                                Picker("Day", selection: Binding(
                                    get: { store.reminderSettings.uricAcidDay },
                                    set: { val in store.updateReminders { $0.uricAcidDay = val } }
                                )) {
                                    ForEach(0..<7) { i in
                                        Text(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i]).tag(i)
                                    }
                                }
                                .pickerStyle(.menu)
                                .tint(GC.accent)
                            } else {
                                Picker("Day", selection: Binding(
                                    get: { store.reminderSettings.uricAcidDay },
                                    set: { val in store.updateReminders { $0.uricAcidDay = val } }
                                )) {
                                    ForEach(1..<29) { i in
                                        Text("\(i)").tag(i)
                                    }
                                }
                                .pickerStyle(.menu)
                                .tint(GC.accent)
                            }
                        }

                        reminderTimeRow(label: "Time", time: Binding(
                            get: { timeFromString(store.reminderSettings.uricAcidTime) },
                            set: { val in store.updateReminders { $0.uricAcidTime = stringFromTime(val) } }
                        ))
                    }
                    .padding(16)
                }
            }
            .background(GC.bgCard)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(GC.border, lineWidth: 1))
        }
    }

    // MARK: - Helpers

    private func reminderToggleRow(icon: String, iconColor: Color, iconBg: Color, title: String, subtitle: String, isOn: Bool, onToggle: @escaping (Bool) -> Void) -> some View {
        HStack {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(iconBg)
                        .frame(width: 36, height: 36)
                    Image(systemName: icon)
                        .font(.system(size: 16))
                        .foregroundColor(iconColor)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(GC.text)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundColor(GC.textTertiary)
                }
            }
            Spacer()
            Toggle("", isOn: Binding(
                get: { isOn },
                set: { onToggle($0) }
            ))
            .tint(GC.accent)
            .labelsHidden()
        }
        .padding(16)
    }

    private func reminderTimeRow(label: String, time: Binding<Date>) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(GC.textSecondary)
            Spacer()
            DatePicker("", selection: time, displayedComponents: .hourAndMinute)
                .labelsHidden()
                .tint(GC.accent)
        }
    }

    private func toggleReminder(keyPath: WritableKeyPath<ReminderSettings, Bool>, enabled: Bool) {
        if enabled {
            store.requestNotificationPermission { granted in
                if granted {
                    store.updateReminders { $0[keyPath: keyPath] = true }
                }
            }
        } else {
            store.updateReminders { $0[keyPath: keyPath] = false }
        }
    }

    private func timeFromString(_ str: String) -> Date {
        let parts = str.split(separator: ":").compactMap { Int($0) }
        guard parts.count == 2 else { return Date() }
        var components = Calendar.current.dateComponents([.year, .month, .day], from: Date())
        components.hour = parts[0]
        components.minute = parts[1]
        return Calendar.current.date(from: components) ?? Date()
    }

    private func stringFromTime(_ date: Date) -> String {
        let comps = Calendar.current.dateComponents([.hour, .minute], from: date)
        return String(format: "%02d:%02d", comps.hour ?? 0, comps.minute ?? 0)
    }

    private func themePreviewColor(_ theme: AppTheme) -> Color {
        switch theme {
        case .dark: return Color(hex: 0x1A1A2E)
        case .light: return Color(hex: 0xF0F2F5)
        case .system: return Color(hex: 0x888888)
        }
    }

    private var planLabel: String {
        if store.hasPaidSubscription {
            return store.currentPlanName + " Premium"
        }
        if store.isTrialActive { return "Free Trial" }
        return "No Active Plan"
    }

    private var subscriptionBadgeColor: Color {
        if store.storeManager.isInGracePeriod || store.storeManager.isInBillingRetry {
            return GC.warning
        }
        if store.isSubscribed { return GC.success }
        return GC.textTertiary
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

// MARK: - Share Helper
private func presentShareSheet(url: URL) {
    let avc = UIActivityViewController(activityItems: [url], applicationActivities: nil)
    guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let root = scene.windows.first?.rootViewController else { return }
    let presenter = root.presentedViewController ?? root
    avc.popoverPresentationController?.sourceView = presenter.view
    presenter.present(avc, animated: true)
}
