import SwiftUI
import UIKit

struct DashboardView: View {
    @EnvironmentObject var store: DataStore
    @State private var dailyLog: DailyLog = DailyLog(date: Date().dateKey)
    @State private var waterTotal = 0
    @State private var showFoodLog = false
    @State private var showWaterLog = false
    @State private var showUricAcidLog = false
    @State private var showFlareLog = false
    @State private var isExportingPDF = false

    private var purinePercent: Double {
        min(Double(dailyLog.totalPurine) / Double(store.profile.purineTarget), 1.5)
    }

    private var statusMessage: (String, Color) {
        let pct = purinePercent
        if pct < 0.5 { return ("On track — keep it up!", GC.success) }
        if pct < 0.8 { return ("Getting close to your limit", GC.warning) }
        return ("Over limit — be careful", GC.danger)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("GoutCare")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(GC.text)
                        Text(Date(), style: .date)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(GC.textSecondary)
                    }
                    Spacer()
                    if store.isTrialActive {
                        Text("\(store.trialDaysRemaining)d left")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(GC.accent)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(GC.accentLight)
                            .cornerRadius(20)
                    }
                }
                .padding(.bottom, 4)

                // Purine Progress Card
                VStack(spacing: 12) {
                    HStack {
                        Text("Daily Purine Intake")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(GC.accent)
                            .textCase(.uppercase)
                        Spacer()
                        Text("\(dailyLog.totalPurine) / \(store.profile.purineTarget) mg")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(GC.text)
                    }

                    // Progress bar
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 6)
                                .fill(GC.border)
                                .frame(height: 10)
                            RoundedRectangle(cornerRadius: 6)
                                .fill(statusMessage.1)
                                .frame(width: min(geo.size.width * CGFloat(purinePercent), geo.size.width), height: 10)
                                .animation(.spring(response: 0.6), value: purinePercent)
                        }
                    }
                    .frame(height: 10)

                    HStack {
                        Circle().fill(statusMessage.1).frame(width: 8, height: 8)
                        Text(statusMessage.0)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(statusMessage.1)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .card()

                // Quick Stats
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    StatCard(icon: "drop.fill", title: "Uric Acid", value: latestUricAcid, color: uricAcidColor)
                    StatCard(icon: "flame.fill", title: "Last Flare", value: lastFlareText, color: GC.orange)
                    StatCard(icon: "drop.triangle.fill", title: "Water", value: "\(waterTotal) / \(store.profile.waterGoal) oz", color: GC.cyan)
                    StatCard(icon: "fork.knife", title: "Foods Today", value: "\(dailyLog.foods.count) items", color: GC.purple)
                }

                // PDF Report Promo
                Button {
                    guard !isExportingPDF else { return }
                    isExportingPDF = true
                    Task {
                        let pdfData = store.exportPDFReport()
                        let url = FileManager.default.temporaryDirectory
                            .appendingPathComponent("GoutCare-Report-\(Date().dateKey).pdf")
                        try? pdfData.write(to: url)
                        isExportingPDF = false
                        sharePDF(url: url)
                    }
                } label: {
                    HStack(spacing: 14) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(
                                    LinearGradient(colors: [GC.accent, Color(hex: 0x6366F1)],
                                                   startPoint: .topLeading, endPoint: .bottomTrailing)
                                )
                                .frame(width: 44, height: 44)
                            if isExportingPDF {
                                ProgressView().tint(.white)
                            } else {
                                Image(systemName: "doc.text.fill")
                                    .font(.system(size: 20))
                                    .foregroundColor(.white)
                            }
                        }
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Share Health Report")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(GC.text)
                            Text("Export a professional PDF for your doctor")
                                .font(.system(size: 12))
                                .foregroundColor(GC.textSecondary)
                        }
                        Spacer()
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(GC.accent)
                    }
                    .padding(14)
                    .background(
                        LinearGradient(
                            colors: [GC.accent.opacity(0.08), GC.purple.opacity(0.08)],
                            startPoint: .leading, endPoint: .trailing
                        )
                    )
                    .cornerRadius(14)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14)
                            .stroke(GC.accent.opacity(0.25), lineWidth: 1)
                    )
                }

                // Quick Actions
                VStack(spacing: 10) {
                    Text("Quick Actions")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(GC.accent)
                        .textCase(.uppercase)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                        ActionButton(icon: "plus.circle.fill", label: "Add Food", color: GC.accent) { showFoodLog = true }
                        ActionButton(icon: "drop.fill", label: "Log Water", color: GC.cyan) { showWaterLog = true }
                        ActionButton(icon: "chart.line.uptrend.xyaxis", label: "Log Uric Acid", color: GC.success) { showUricAcidLog = true }
                        ActionButton(icon: "bolt.fill", label: "Log Flare", color: GC.orange) { showFlareLog = true }
                    }
                }

                // Today's Foods
                if !dailyLog.foods.isEmpty {
                    VStack(spacing: 10) {
                        Text("Today's Foods")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(GC.accent)
                            .textCase(.uppercase)
                            .frame(maxWidth: .infinity, alignment: .leading)

                        ForEach(dailyLog.foods.reversed()) { entry in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(entry.name)
                                        .font(.system(size: 15, weight: .semibold))
                                        .foregroundColor(GC.text)
                                    Text(entry.timestamp.timeString)
                                        .font(.system(size: 12))
                                        .foregroundColor(GC.textTertiary)
                                }
                                Spacer()
                                Text("\(entry.purineContent) mg")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(GC.purineColor(.from(mg: entry.purineContent)))
                            }
                            .padding(12)
                            .background(GC.bgCard)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 32)
        }
        .background(GC.bg.ignoresSafeArea())
        .onAppear(perform: refresh)
        .sheet(isPresented: $showFoodLog) { AddFoodSheet(onDone: refresh) }
        .sheet(isPresented: $showWaterLog) { AddWaterSheet(onDone: refresh) }
        .sheet(isPresented: $showUricAcidLog) { AddUricAcidSheet(onDone: refresh) }
        .sheet(isPresented: $showFlareLog) { AddFlareSheet(onDone: refresh) }
    }

    private func refresh() {
        dailyLog = store.getDailyLog()
        waterTotal = store.getWaterIntake().total
    }

    private func sharePDF(url: URL) {
        let avc = UIActivityViewController(activityItems: [url], applicationActivities: nil)
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let root = scene.windows.first?.rootViewController else { return }
        let presenter = root.presentedViewController ?? root
        avc.popoverPresentationController?.sourceView = presenter.view
        presenter.present(avc, animated: true)
    }

    private var latestUricAcid: String {
        guard let r = store.uricAcidReadings.first else { return "—" }
        return String(format: "%.1f mg/dL", r.value)
    }

    private var uricAcidColor: Color {
        guard let r = store.uricAcidReadings.first else { return GC.textSecondary }
        return GC.uricAcidColor(r.value)
    }

    private var lastFlareText: String {
        guard let days = store.daysSinceLastFlare else { return "None" }
        return "\(days) days ago"
    }
}

// MARK: - Stat Card
struct StatCard: View {
    let icon: String
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(GC.textSecondary)
            Text(value)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(GC.text)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card()
    }
}

// MARK: - Action Button
struct ActionButton: View {
    let icon: String
    let label: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: icon).font(.system(size: 16))
                Text(label).font(.system(size: 14, weight: .semibold))
            }
            .foregroundColor(color)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(color.opacity(0.12))
            .cornerRadius(12)
        }
    }
}

// MARK: - Add Food Sheet
struct AddFoodSheet: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss
    @State private var search = ""
    var onDone: () -> Void

    private var filtered: [FoodItem] {
        if search.isEmpty { return [] }
        return purineDatabase.filter { $0.name.localizedCaseInsensitiveContains(search) }.prefix(20).map { $0 }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                TextField("Search foods...", text: $search)
                    .padding(12)
                    .background(GC.bgInput)
                    .cornerRadius(10)
                    .foregroundColor(GC.text)
                    .padding()

                if filtered.isEmpty && !search.isEmpty {
                    Text("No foods found")
                        .foregroundColor(GC.textTertiary)
                        .padding(.top, 40)
                    Spacer()
                } else {
                    List(filtered) { food in
                        Button {
                            let entry = FoodEntry(foodId: food.id, name: food.name, servingSize: food.servingSize, purineContent: food.purineContent)
                            store.addFoodEntry(entry)
                            onDone()
                            dismiss()
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(food.name)
                                        .font(.system(size: 15, weight: .semibold))
                                        .foregroundColor(GC.text)
                                    Text(food.servingSize)
                                        .font(.system(size: 12))
                                        .foregroundColor(GC.textTertiary)
                                }
                                Spacer()
                                PurineBadge(level: food.purineLevel, mg: food.purineContent)
                            }
                        }
                        .listRowBackground(GC.bgCard)
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                }
            }
            .background(GC.bg.ignoresSafeArea())
            .navigationTitle("Add Food")
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

// MARK: - Add Water Sheet
struct AddWaterSheet: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss
    let presets = [8, 12, 16, 20]
    @State private var custom = ""
    var onDone: () -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("How much water?")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(GC.text)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(presets, id: \.self) { oz in
                        Button {
                            store.addWaterEntry(oz)
                            onDone()
                            dismiss()
                        } label: {
                            VStack(spacing: 4) {
                                Image(systemName: "drop.fill").font(.system(size: 24)).foregroundColor(GC.cyan)
                                Text("\(oz) oz").font(.system(size: 16, weight: .bold)).foregroundColor(GC.text)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 20)
                            .background(GC.cyanLight)
                            .cornerRadius(12)
                        }
                    }
                }

                HStack {
                    TextField("Custom oz", text: $custom)
                        .keyboardType(.numberPad)
                        .padding(12)
                        .background(GC.bgInput)
                        .cornerRadius(10)
                        .foregroundColor(GC.text)

                    Button("Add") {
                        if let oz = Int(custom), oz > 0 {
                            store.addWaterEntry(oz)
                            onDone()
                            dismiss()
                        }
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .frame(width: 80)
                }

                Spacer()
            }
            .padding()
            .background(GC.bg.ignoresSafeArea())
            .navigationTitle("Log Water")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }.foregroundColor(GC.accent)
                }
            }
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
        .presentationDetents([.medium])
    }
}

// MARK: - Add Uric Acid Sheet
struct AddUricAcidSheet: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss
    @State private var value = ""
    @State private var notes = ""
    @State private var date = Date()
    var onDone: () -> Void

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                DatePicker("Date", selection: $date, displayedComponents: .date)
                    .foregroundColor(GC.text)
                    .colorScheme(.dark)

                VStack(alignment: .leading, spacing: 6) {
                    Text("Value (mg/dL)").font(.system(size: 13, weight: .semibold)).foregroundColor(GC.textSecondary)
                    TextField("e.g. 5.8", text: $value)
                        .keyboardType(.decimalPad)
                        .padding(12)
                        .background(GC.bgInput)
                        .cornerRadius(10)
                        .foregroundColor(GC.text)
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("Notes (optional)").font(.system(size: 13, weight: .semibold)).foregroundColor(GC.textSecondary)
                    TextField("Any notes...", text: $notes)
                        .padding(12)
                        .background(GC.bgInput)
                        .cornerRadius(10)
                        .foregroundColor(GC.text)
                }

                Button("Save Reading") {
                    if let val = Double(value), val > 0 {
                        store.addUricAcidReading(UricAcidReading(date: date, value: val, notes: notes))
                        onDone()
                        dismiss()
                    }
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(Double(value) == nil)

                Spacer()
            }
            .padding()
            .background(GC.bg.ignoresSafeArea())
            .navigationTitle("Log Uric Acid")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }.foregroundColor(GC.accent)
                }
            }
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
        .presentationDetents([.medium])
    }
}

// MARK: - Add Flare Sheet
struct AddFlareSheet: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) var dismiss
    @State private var date = Date()
    @State private var painLevel: Double = 5
    @State private var selectedJoints: Set<Joint> = []
    @State private var selectedTriggers: Set<Trigger> = []
    @State private var selectedTreatments: Set<Treatment> = []
    @State private var durationDays = ""
    @State private var notes = ""
    var onDone: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                        .foregroundColor(GC.text)
                        .colorScheme(.dark)

                    // Pain Level
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Pain Level").font(.system(size: 13, weight: .semibold)).foregroundColor(GC.textSecondary)
                            Spacer()
                            Text("\(Int(painLevel))").font(.system(size: 20, weight: .bold)).foregroundColor(painColor)
                        }
                        Slider(value: $painLevel, in: 1...10, step: 1)
                            .tint(painColor)
                    }

                    // Joints
                    ChipSelector(title: "Affected Joints", items: Joint.allCases, selected: $selectedJoints, label: \.label)

                    // Triggers
                    ChipSelector(title: "Triggers", items: Trigger.allCases, selected: $selectedTriggers, label: \.label)

                    // Treatments
                    ChipSelector(title: "Treatments", items: Treatment.allCases, selected: $selectedTreatments, label: \.label)

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Duration (days)").font(.system(size: 13, weight: .semibold)).foregroundColor(GC.textSecondary)
                        TextField("e.g. 3", text: $durationDays)
                            .keyboardType(.numberPad)
                            .padding(12)
                            .background(GC.bgInput)
                            .cornerRadius(10)
                            .foregroundColor(GC.text)
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Notes").font(.system(size: 13, weight: .semibold)).foregroundColor(GC.textSecondary)
                        TextField("Any notes...", text: $notes)
                            .padding(12)
                            .background(GC.bgInput)
                            .cornerRadius(10)
                            .foregroundColor(GC.text)
                    }

                    Button("Save Flare") {
                        let flare = GoutFlare(
                            date: date,
                            joints: Array(selectedJoints),
                            painLevel: Int(painLevel),
                            durationDays: Int(durationDays) ?? 0,
                            triggers: Array(selectedTriggers),
                            treatments: Array(selectedTreatments),
                            notes: notes
                        )
                        store.addGoutFlare(flare)
                        onDone()
                        dismiss()
                    }
                    .buttonStyle(PrimaryButtonStyle())
                    .disabled(selectedJoints.isEmpty)
                }
                .padding()
            }
            .background(GC.bg.ignoresSafeArea())
            .navigationTitle("Log Flare")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }.foregroundColor(GC.accent)
                }
            }
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }

    private var painColor: Color {
        if painLevel <= 3 { return GC.success }
        if painLevel <= 6 { return GC.warning }
        return GC.danger
    }
}

// MARK: - Chip Selector
struct ChipSelector<T: Hashable & Identifiable>: View {
    let title: String
    let items: [T]
    @Binding var selected: Set<T>
    let label: (T) -> String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.system(size: 13, weight: .semibold)).foregroundColor(GC.textSecondary)
            FlowLayout(spacing: 8) {
                ForEach(items) { item in
                    let isSelected = selected.contains(item)
                    Button {
                        if isSelected { selected.remove(item) } else { selected.insert(item) }
                    } label: {
                        Text(label(item))
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(isSelected ? .white : GC.textSecondary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(isSelected ? GC.accent : GC.bgInput)
                            .cornerRadius(20)
                    }
                }
            }
        }
    }
}

// MARK: - Flow Layout (wrapping)
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var maxX: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            maxX = max(maxX, x)
        }

        return (positions, CGSize(width: maxX, height: y + rowHeight))
    }
}

// MARK: - Purine Badge
struct PurineBadge: View {
    let level: PurineLevel
    let mg: Int

    var body: some View {
        HStack(spacing: 4) {
            Text("\(mg) mg")
                .font(.system(size: 12, weight: .bold))
        }
        .foregroundColor(GC.purineColor(level))
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(GC.purineColorLight(level))
        .cornerRadius(20)
    }
}
