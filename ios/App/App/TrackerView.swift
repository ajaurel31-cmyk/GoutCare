import SwiftUI

struct TrackerView: View {
    @EnvironmentObject var store: DataStore
    @State private var selectedTab = 0
    @State private var showAddReading = false
    @State private var showAddFlare = false

    var body: some View {
        VStack(spacing: 0) {
            // Header
            Text("Health Tracker")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(GC.text)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 16)

            // Tab picker
            Picker("", selection: $selectedTab) {
                Text("Uric Acid").tag(0)
                Text("Flares").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)

            if selectedTab == 0 {
                UricAcidTab(showAddReading: $showAddReading)
            } else {
                FlaresTab(showAddFlare: $showAddFlare)
            }
        }
        .background(GC.bg.ignoresSafeArea())
        .overlay(alignment: .bottomTrailing) {
            Button {
                if selectedTab == 0 { showAddReading = true } else { showAddFlare = true }
            } label: {
                Image(systemName: "plus")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
                    .frame(width: 56, height: 56)
                    .background(GC.accent)
                    .clipShape(Circle())
                    .shadow(color: GC.accent.opacity(0.4), radius: 12, y: 4)
            }
            .padding(.trailing, 20)
            .padding(.bottom, 90)
        }
        .sheet(isPresented: $showAddReading) { AddUricAcidSheet(onDone: {}) }
        .sheet(isPresented: $showAddFlare) { AddFlareSheet(onDone: {}) }
    }
}

// MARK: - Uric Acid Tab
struct UricAcidTab: View {
    @EnvironmentObject var store: DataStore
    @Binding var showAddReading: Bool

    private var readings: [UricAcidReading] { store.uricAcidReadings }

    private var average: Double {
        guard !readings.isEmpty else { return 0 }
        return readings.map(\.value).reduce(0, +) / Double(readings.count)
    }

    private var inRangePercent: Int {
        guard !readings.isEmpty else { return 0 }
        let good = readings.filter { $0.value <= Constants.uricAcidTarget }.count
        return Int(Double(good) / Double(readings.count) * 100)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Stats
                HStack(spacing: 12) {
                    MiniStatCard(title: "Latest", value: readings.first.map { String(format: "%.1f", $0.value) } ?? "—", unit: "mg/dL", color: readings.first.map { GC.uricAcidColor($0.value) } ?? GC.textSecondary)
                    MiniStatCard(title: "Average", value: readings.isEmpty ? "—" : String(format: "%.1f", average), unit: "mg/dL", color: GC.accent)
                    MiniStatCard(title: "In Range", value: readings.isEmpty ? "—" : "\(inRangePercent)%", unit: "≤6.0", color: GC.success)
                }

                // Chart
                if readings.count >= 2 {
                    UricAcidChartView(readings: Array(readings.prefix(12).reversed()))
                        .card()
                }

                // List
                if readings.isEmpty {
                    EmptyStateView(icon: "chart.line.uptrend.xyaxis", title: "No Readings Yet", text: "Tap + to log your first uric acid reading")
                } else {
                    ForEach(readings) { reading in
                        ReadingRow(reading: reading) {
                            store.deleteUricAcidReading(reading.id)
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 120)
        }
    }
}

// MARK: - Flares Tab
struct FlaresTab: View {
    @EnvironmentObject var store: DataStore
    @Binding var showAddFlare: Bool

    private var flares: [GoutFlare] { store.goutFlares }

    private var avgPain: Double {
        guard !flares.isEmpty else { return 0 }
        return Double(flares.map(\.painLevel).reduce(0, +)) / Double(flares.count)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack(spacing: 12) {
                    MiniStatCard(title: "Total Flares", value: "\(flares.count)", unit: "", color: GC.orange)
                    MiniStatCard(title: "Avg Pain", value: flares.isEmpty ? "—" : String(format: "%.1f", avgPain), unit: "/10", color: GC.danger)
                }

                if flares.isEmpty {
                    EmptyStateView(icon: "bolt.fill", title: "No Flares Logged", text: "Tap + to log a gout flare")
                } else {
                    ForEach(flares) { flare in
                        FlareRow(flare: flare) {
                            store.deleteGoutFlare(flare.id)
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 120)
        }
    }
}

// MARK: - Mini Stat Card
struct MiniStatCard: View {
    let title: String
    let value: String
    let unit: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(GC.textSecondary)
            Text(value)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(color)
            if !unit.isEmpty {
                Text(unit)
                    .font(.system(size: 11))
                    .foregroundColor(GC.textTertiary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(GC.bgCard)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
    }
}

// MARK: - Uric Acid Chart
struct UricAcidChartView: View {
    let readings: [UricAcidReading]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Trend")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(GC.accent)
                .textCase(.uppercase)

            GeometryReader { geo in
                let w = geo.size.width
                let h = geo.size.height
                let values = readings.map(\.value)
                let minV = max(0, (values.min() ?? 0) - 1)
                let maxV = (values.max() ?? 10) + 1
                let range = maxV - minV

                ZStack {
                    // Target line at 6.0
                    let targetY = h - ((6.0 - minV) / range * h)
                    Path { p in
                        p.move(to: CGPoint(x: 0, y: targetY))
                        p.addLine(to: CGPoint(x: w, y: targetY))
                    }
                    .stroke(GC.success.opacity(0.4), style: StrokeStyle(lineWidth: 1, dash: [5, 5]))

                    Text("6.0")
                        .font(.system(size: 9))
                        .foregroundColor(GC.success.opacity(0.6))
                        .position(x: 16, y: targetY - 8)

                    // Line path
                    if values.count >= 2 {
                        Path { p in
                            for (i, val) in values.enumerated() {
                                let x = w * CGFloat(i) / CGFloat(values.count - 1)
                                let y = h - ((val - minV) / range * h)
                                if i == 0 { p.move(to: CGPoint(x: x, y: y)) }
                                else { p.addLine(to: CGPoint(x: x, y: y)) }
                            }
                        }
                        .stroke(GC.accent, lineWidth: 2)
                    }

                    // Dots
                    ForEach(Array(values.enumerated()), id: \.offset) { i, val in
                        let x = w * CGFloat(i) / CGFloat(max(1, values.count - 1))
                        let y = h - ((val - minV) / range * h)
                        Circle()
                            .fill(GC.uricAcidColor(val))
                            .frame(width: 8, height: 8)
                            .position(x: x, y: y)
                    }

                    // First and last labels
                    if let first = values.first {
                        let y = h - ((first - minV) / range * h)
                        Text(String(format: "%.1f", first))
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(GC.text)
                            .position(x: 20, y: y + 14)
                    }
                    if values.count > 1, let last = values.last {
                        let y = h - ((last - minV) / range * h)
                        Text(String(format: "%.1f", last))
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(GC.text)
                            .position(x: w - 20, y: y + 14)
                    }
                }
            }
            .frame(height: 140)
        }
    }
}

// MARK: - Reading Row
struct ReadingRow: View {
    let reading: UricAcidReading
    let onDelete: () -> Void

    private var statusLabel: String {
        if reading.value <= 6.0 { return "Normal" }
        if reading.value <= 7.0 { return "Elevated" }
        return "High"
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(reading.date.relativeString)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(GC.text)
                if !reading.notes.isEmpty {
                    Text(reading.notes)
                        .font(.system(size: 12))
                        .foregroundColor(GC.textTertiary)
                        .lineLimit(1)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(String(format: "%.1f", reading.value))
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(GC.uricAcidColor(reading.value))
                Text(statusLabel)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(GC.uricAcidColor(reading.value))
            }
            Button(action: onDelete) {
                Image(systemName: "trash")
                    .font(.system(size: 14))
                    .foregroundColor(GC.textTertiary)
            }
            .padding(.leading, 8)
        }
        .padding(14)
        .background(GC.bgCard)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
    }
}

// MARK: - Flare Row
struct FlareRow: View {
    let flare: GoutFlare
    let onDelete: () -> Void

    private var painColor: Color {
        if flare.painLevel <= 3 { return GC.success }
        if flare.painLevel <= 6 { return GC.warning }
        return GC.danger
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(flare.date.relativeString)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(GC.text)
                Spacer()
                Text("Pain: \(flare.painLevel)")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(painColor)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(painColor.opacity(0.12))
                    .cornerRadius(20)
                Button(action: onDelete) {
                    Image(systemName: "trash")
                        .font(.system(size: 14))
                        .foregroundColor(GC.textTertiary)
                }
            }

            // Joints
            if !flare.joints.isEmpty {
                FlowLayout(spacing: 6) {
                    ForEach(flare.joints) { joint in
                        Text(joint.label)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(GC.accent)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(GC.accentLight)
                            .cornerRadius(12)
                    }
                }
            }

            // Triggers
            if !flare.triggers.isEmpty {
                FlowLayout(spacing: 6) {
                    ForEach(flare.triggers) { trigger in
                        Text(trigger.label)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(GC.orange)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(GC.orangeLight)
                            .cornerRadius(12)
                    }
                }
            }

            // Treatments
            if !flare.treatments.isEmpty {
                FlowLayout(spacing: 6) {
                    ForEach(flare.treatments) { treatment in
                        Text(treatment.label)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(GC.success)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(GC.successLight)
                            .cornerRadius(12)
                    }
                }
            }

            if flare.durationDays > 0 {
                Text("Duration: \(flare.durationDays) day\(flare.durationDays == 1 ? "" : "s")")
                    .font(.system(size: 12))
                    .foregroundColor(GC.textTertiary)
            }

            if !flare.notes.isEmpty {
                Text(flare.notes)
                    .font(.system(size: 12))
                    .foregroundColor(GC.textTertiary)
            }
        }
        .padding(14)
        .background(GC.bgCard)
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
    }
}

// MARK: - Empty State
struct EmptyStateView: View {
    let icon: String
    let title: String
    let text: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundColor(GC.accent)
                .frame(width: 64, height: 64)
                .background(GC.accentLight)
                .clipShape(Circle())
            Text(title)
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(GC.text)
            Text(text)
                .font(.system(size: 14))
                .foregroundColor(GC.textSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(48)
    }
}
