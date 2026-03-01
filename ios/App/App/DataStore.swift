import Foundation
import Combine
import SwiftUI
import StoreKit
import UserNotifications

// MARK: - DataStore (UserDefaults persistence)

@MainActor
class DataStore: ObservableObject {
    static let shared = DataStore()

    private let defaults = UserDefaults.standard
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    private var cancellables = Set<AnyCancellable>()

    // MARK: Published State
    @Published var profile: UserProfile
    @Published var subscription: SubscriptionStatus
    @Published var medications: [Medication]
    @Published var uricAcidReadings: [UricAcidReading]
    @Published var goutFlares: [GoutFlare]
    @Published var reminderSettings: ReminderSettings

    // StoreKit manager
    let storeManager = StoreManager.shared

    init() {
        self.profile = Self.load("gc_profile") ?? UserProfile()
        self.subscription = Self.load("gc_subscription") ?? SubscriptionStatus()
        self.medications = Self.load("gc_medications") ?? []
        self.uricAcidReadings = Self.load("gc_uric_acid") ?? []
        self.goutFlares = Self.load("gc_flares") ?? []
        self.reminderSettings = Self.load("gc_reminders") ?? ReminderSettings()

        // Observe StoreManager changes to refresh subscription state
        storeManager.objectWillChange.sink { [weak self] _ in
            DispatchQueue.main.async {
                self?.syncSubscriptionFromStore()
            }
        }.store(in: &cancellables)

        // Sync on launch
        Task {
            await storeManager.updateSubscriptionStatus()
            syncSubscriptionFromStore()
        }
    }

    // MARK: - Theme

    var activeColorScheme: ColorScheme? {
        (AppTheme(rawValue: profile.theme) ?? .dark).colorScheme
    }

    // MARK: - Profile

    func updateProfile(_ update: (inout UserProfile) -> Void) {
        update(&profile)
        save(profile, key: "gc_profile")
    }

    // MARK: - Subscription

    /// User is subscribed if they have an active StoreKit subscription OR a valid local trial
    var isSubscribed: Bool {
        storeManager.hasActiveSubscription || isTrialActive
    }

    /// Whether the local free trial is still active
    var isTrialActive: Bool {
        guard subscription.isTrial, let expStr = subscription.expiresAt else { return false }
        let fmt = ISO8601DateFormatter()
        if let exp = fmt.date(from: expStr) { return Date() < exp }
        return false
    }

    /// Days remaining on local trial
    var trialDaysRemaining: Int {
        guard subscription.isTrial, let expStr = subscription.expiresAt else { return 0 }
        let fmt = ISO8601DateFormatter()
        guard let exp = fmt.date(from: expStr) else { return 0 }
        return max(0, Calendar.current.dateComponents([.day], from: Date(), to: exp).day ?? 0)
    }

    /// Whether user has a paid StoreKit subscription (not just trial)
    var hasPaidSubscription: Bool {
        storeManager.hasActiveSubscription
    }

    /// Display name for current plan
    var currentPlanName: String {
        if storeManager.hasActiveSubscription {
            return storeManager.activePlanName
        }
        if isTrialActive { return "Free Trial" }
        return "None"
    }

    /// Expiration date for display
    var subscriptionExpirationDate: String? {
        if storeManager.hasActiveSubscription {
            return storeManager.formattedExpirationDate
        }
        if isTrialActive, let expStr = subscription.expiresAt {
            let fmt = ISO8601DateFormatter()
            if let exp = fmt.date(from: expStr) {
                let df = DateFormatter()
                df.dateStyle = .medium
                return df.string(from: exp)
            }
        }
        return nil
    }

    /// Start a local 7-day free trial (no payment required)
    func startTrial() {
        let exp = Calendar.current.date(byAdding: .day, value: Constants.trialDays, to: Date())!
        let expString = ISO8601DateFormatter().string(from: exp)
        subscription = SubscriptionStatus(
            isActive: false,
            plan: "trial",
            expiresAt: expString,
            isTrial: true
        )
        save(subscription, key: "gc_subscription")
        updateProfile { $0.onboardingComplete = true }
    }

    /// Purchase a StoreKit subscription
    func purchaseSubscription(_ product: Product) async -> Bool {
        let success = await storeManager.purchase(product)
        if success {
            syncSubscriptionFromStore()
            updateProfile { $0.onboardingComplete = true }
        }
        return success
    }

    /// Restore purchases via StoreKit
    func restorePurchases() async {
        await storeManager.restorePurchases()
        syncSubscriptionFromStore()
    }

    /// Open system subscription management
    func manageSubscription() async {
        await storeManager.showManageSubscription()
    }

    /// Sync local subscription status from StoreKit state
    private func syncSubscriptionFromStore() {
        if storeManager.hasActiveSubscription {
            let plan = storeManager.activePlanName.lowercased()
            let expStr = storeManager.subscriptionExpirationDate.map {
                ISO8601DateFormatter().string(from: $0)
            }
            subscription = SubscriptionStatus(
                isActive: true,
                plan: plan,
                expiresAt: expStr,
                isTrial: false
            )
            save(subscription, key: "gc_subscription")
        }
        objectWillChange.send()
    }

    /// Legacy method kept for backward compatibility — now triggers StoreKit purchase
    func activateSubscription(plan: String) {
        // In production, this should go through StoreKit purchase flow.
        // This is called from OnboardingView/PaywallView which now use the async purchase flow.
        updateProfile { $0.onboardingComplete = true }
    }

    // MARK: - Daily Log

    func getDailyLog(for date: Date = Date()) -> DailyLog {
        let key = "gc_daily_\(date.dateKey)"
        return Self.load(key) ?? DailyLog(date: date.dateKey)
    }

    func addFoodEntry(_ entry: FoodEntry, date: Date = Date()) {
        var log = getDailyLog(for: date)
        log.foods.append(entry)
        log.totalPurine = log.foods.reduce(0) { $0 + $1.purineContent }
        save(log, key: "gc_daily_\(date.dateKey)")
        objectWillChange.send()
    }

    func removeFoodEntry(_ entryId: String, date: Date = Date()) {
        var log = getDailyLog(for: date)
        log.foods.removeAll { $0.id == entryId }
        log.totalPurine = log.foods.reduce(0) { $0 + $1.purineContent }
        save(log, key: "gc_daily_\(date.dateKey)")
        objectWillChange.send()
    }

    // MARK: - Uric Acid

    func addUricAcidReading(_ reading: UricAcidReading) {
        uricAcidReadings.insert(reading, at: 0)
        uricAcidReadings.sort { $0.date > $1.date }
        save(uricAcidReadings, key: "gc_uric_acid")
    }

    func deleteUricAcidReading(_ id: String) {
        uricAcidReadings.removeAll { $0.id == id }
        save(uricAcidReadings, key: "gc_uric_acid")
    }

    // MARK: - Flares

    func addGoutFlare(_ flare: GoutFlare) {
        goutFlares.insert(flare, at: 0)
        goutFlares.sort { $0.date > $1.date }
        save(goutFlares, key: "gc_flares")
    }

    func deleteGoutFlare(_ id: String) {
        goutFlares.removeAll { $0.id == id }
        save(goutFlares, key: "gc_flares")
    }

    // MARK: - Water

    func getWaterIntake(for date: Date = Date()) -> (entries: [WaterEntry], total: Int) {
        let key = "gc_water_\(date.dateKey)"
        let entries: [WaterEntry] = Self.load(key) ?? []
        return (entries, entries.reduce(0) { $0 + $1.amount })
    }

    func addWaterEntry(_ amount: Int, date: Date = Date()) {
        let key = "gc_water_\(date.dateKey)"
        var entries: [WaterEntry] = Self.load(key) ?? []
        entries.append(WaterEntry(amount: amount))
        save(entries, key: key)
        objectWillChange.send()
    }

    // MARK: - Medications

    func addMedication(_ med: Medication) {
        medications.append(med)
        save(medications, key: "gc_medications")
    }

    func deleteMedication(_ id: String) {
        medications.removeAll { $0.id == id }
        save(medications, key: "gc_medications")
    }

    // MARK: - Scan Count

    func getScanCount(for date: Date = Date()) -> Int {
        defaults.integer(forKey: "gc_scans_\(date.dateKey)")
    }

    func incrementScanCount(for date: Date = Date()) {
        let key = "gc_scans_\(date.dateKey)"
        defaults.set(getScanCount(for: date) + 1, forKey: key)
    }

    // MARK: - Days Since Last Flare

    var daysSinceLastFlare: Int? {
        guard let last = goutFlares.first else { return nil }
        return Calendar.current.dateComponents([.day], from: last.date, to: Date()).day
    }

    // MARK: - Export

    func exportAllData() -> Data? {
        var export: [String: String] = [:]
        for key in defaults.dictionaryRepresentation().keys where key.hasPrefix("gc_") {
            if let data = defaults.data(forKey: key), let str = String(data: data, encoding: .utf8) {
                export[key] = str
            } else if let val = defaults.object(forKey: key) {
                export[key] = "\(val)"
            }
        }
        return try? JSONSerialization.data(withJSONObject: export, options: .prettyPrinted)
    }

    func exportPDFReport() -> Data {
        let pageWidth: CGFloat = 612
        let pageHeight: CGFloat = 792
        let margin: CGFloat = 40
        let contentWidth = pageWidth - margin * 2

        let pdfData = NSMutableData()
        var mediaBox = CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight)

        guard let consumer = CGDataConsumer(data: pdfData as CFMutableData),
              let context = CGContext(consumer: consumer, mediaBox: &mediaBox, nil) else {
            return Data()
        }

        // Colors
        let brandBlue = UIColor(red: 0.23, green: 0.51, blue: 0.96, alpha: 1)
        let brandDarkBlue = UIColor(red: 0.12, green: 0.29, blue: 0.58, alpha: 1)
        let lightBg = UIColor(red: 0.96, green: 0.97, blue: 0.98, alpha: 1)
        let tableBorder = UIColor(red: 0.85, green: 0.87, blue: 0.90, alpha: 1)
        let greenStatus = UIColor(red: 0.13, green: 0.55, blue: 0.13, alpha: 1)
        let orangeStatus = UIColor(red: 0.80, green: 0.52, blue: 0.0, alpha: 1)
        let redStatus = UIColor(red: 0.80, green: 0.15, blue: 0.15, alpha: 1)

        var cursorY: CGFloat = 0
        var pageNum = 0

        func startPage() {
            context.beginPage(mediaBox: &mediaBox)
            pageNum += 1
            cursorY = pageHeight - margin
        }

        func drawFooter() {
            let footerY: CGFloat = 25
            // Thin line
            context.setStrokeColor(tableBorder.cgColor)
            context.setLineWidth(0.5)
            context.move(to: CGPoint(x: margin, y: footerY + 10))
            context.addLine(to: CGPoint(x: pageWidth - margin, y: footerY + 10))
            context.strokePath()
            // Footer text
            let footerFont = UIFont.systemFont(ofSize: 8, weight: .regular)
            let leftAttr: [NSAttributedString.Key: Any] = [.font: footerFont, .foregroundColor: UIColor.gray]
            let leftStr = NSAttributedString(string: "Generated by GoutCare v1.0  •  This report is not medical advice  •  Consult your healthcare provider", attributes: leftAttr)
            let rightStr = NSAttributedString(string: "Page \(pageNum)", attributes: leftAttr)
            leftStr.draw(at: CGPoint(x: margin, y: footerY - 4))
            let rSize = rightStr.size()
            rightStr.draw(at: CGPoint(x: pageWidth - margin - rSize.width, y: footerY - 4))
        }

        func endCurrentPage() {
            drawFooter()
            context.endPage()
        }

        func checkPageBreak(_ needed: CGFloat) {
            if cursorY - needed < margin + 30 {
                endCurrentPage()
                startPage()
            }
        }

        func textHeight(_ text: String, fontSize: CGFloat, weight: UIFont.Weight = .regular, maxWidth: CGFloat) -> CGFloat {
            let font = UIFont.systemFont(ofSize: fontSize, weight: weight)
            let attrStr = NSAttributedString(string: text, attributes: [.font: font])
            let framesetter = CTFramesetterCreateWithAttributedString(attrStr)
            let fitSize = CTFramesetterSuggestFrameSizeWithConstraints(framesetter, CFRange(location: 0, length: attrStr.length), nil, CGSize(width: maxWidth, height: .greatestFiniteMagnitude), nil)
            return fitSize.height
        }

        func drawText(_ text: String, x: CGFloat, fontSize: CGFloat, weight: UIFont.Weight = .regular, color: UIColor = .black, maxWidth: CGFloat = 0) {
            let font = UIFont.systemFont(ofSize: fontSize, weight: weight)
            let attributes: [NSAttributedString.Key: Any] = [.font: font, .foregroundColor: color]
            let w = maxWidth > 0 ? maxWidth : contentWidth - (x - margin)
            let attrStr = NSAttributedString(string: text, attributes: attributes)
            let framesetter = CTFramesetterCreateWithAttributedString(attrStr)
            let fitSize = CTFramesetterSuggestFrameSizeWithConstraints(framesetter, CFRange(location: 0, length: attrStr.length), nil, CGSize(width: w, height: .greatestFiniteMagnitude), nil)
            let path = CGPath(rect: CGRect(x: x, y: cursorY - fitSize.height, width: w, height: fitSize.height), transform: nil)
            let frame = CTFramesetterCreateFrame(framesetter, CFRange(location: 0, length: 0), path, nil)
            context.saveGState()
            CTFrameDraw(frame, context)
            context.restoreGState()
            cursorY -= fitSize.height
        }

        func drawTextAt(_ text: String, x: CGFloat, y: CGFloat, fontSize: CGFloat, weight: UIFont.Weight = .regular, color: UIColor = .black, maxWidth: CGFloat = 200) {
            let font = UIFont.systemFont(ofSize: fontSize, weight: weight)
            let attrStr = NSAttributedString(string: text, attributes: [.font: font, .foregroundColor: color])
            let framesetter = CTFramesetterCreateWithAttributedString(attrStr)
            let fitSize = CTFramesetterSuggestFrameSizeWithConstraints(framesetter, CFRange(location: 0, length: attrStr.length), nil, CGSize(width: maxWidth, height: .greatestFiniteMagnitude), nil)
            let path = CGPath(rect: CGRect(x: x, y: y - fitSize.height, width: maxWidth, height: fitSize.height), transform: nil)
            let frame = CTFramesetterCreateFrame(framesetter, CFRange(location: 0, length: 0), path, nil)
            context.saveGState()
            CTFrameDraw(frame, context)
            context.restoreGState()
        }

        func drawRect(_ rect: CGRect, fill: UIColor) {
            context.saveGState()
            context.setFillColor(fill.cgColor)
            context.fill(rect)
            context.restoreGState()
        }

        func drawRoundedRect(_ rect: CGRect, fill: UIColor, radius: CGFloat = 6, stroke: UIColor? = nil) {
            let path = UIBezierPath(roundedRect: rect, cornerRadius: radius)
            context.saveGState()
            context.setFillColor(fill.cgColor)
            context.addPath(path.cgPath)
            context.fillPath()
            if let stroke = stroke {
                context.setStrokeColor(stroke.cgColor)
                context.setLineWidth(0.5)
                context.addPath(path.cgPath)
                context.strokePath()
            }
            context.restoreGState()
        }

        func drawSectionHeader(_ title: String) {
            checkPageBreak(40)
            cursorY -= 16
            // Blue accent bar
            drawRect(CGRect(x: margin, y: cursorY - 2, width: 4, height: 18), fill: brandBlue)
            drawTextAt(title, x: margin + 12, y: cursorY + 16, fontSize: 14, weight: .bold, color: brandDarkBlue)
            cursorY -= 10
        }

        func drawTableRow(columns: [(String, CGFloat)], y: CGFloat, fontSize: CGFloat = 10, weight: UIFont.Weight = .regular, color: UIColor = .black, bg: UIColor? = nil) {
            let rowH: CGFloat = 22
            if let bg = bg {
                drawRect(CGRect(x: margin, y: y - rowH + 4, width: contentWidth, height: rowH), fill: bg)
            }
            var xOff = margin + 8
            for (text, width) in columns {
                drawTextAt(text, x: xOff, y: y, fontSize: fontSize, weight: weight, color: color, maxWidth: width - 8)
                xOff += width
            }
        }

        let dateFmt = DateFormatter()
        dateFmt.dateFormat = "MMM d, yyyy"
        let timeFmt = DateFormatter()
        timeFmt.dateFormat = "MMMM d, yyyy 'at' h:mm a"

        // ==========================================
        // PAGE 1
        // ==========================================
        startPage()

        // --- Blue header banner ---
        let bannerH: CGFloat = 70
        drawRect(CGRect(x: 0, y: pageHeight - bannerH, width: pageWidth, height: bannerH), fill: brandBlue)
        // Droplet icon area (small circle)
        let iconX: CGFloat = margin + 6
        let iconY = pageHeight - bannerH / 2
        context.saveGState()
        context.setFillColor(UIColor.white.withAlphaComponent(0.2).cgColor)
        context.fillEllipse(in: CGRect(x: iconX - 16, y: iconY - 16, width: 32, height: 32))
        context.restoreGState()
        drawTextAt("G", x: iconX - 7, y: iconY + 10, fontSize: 18, weight: .bold, color: .white, maxWidth: 30)
        drawTextAt("GoutCare Health Report", x: iconX + 26, y: iconY + 11, fontSize: 20, weight: .bold, color: .white, maxWidth: 400)
        drawTextAt(timeFmt.string(from: Date()), x: iconX + 26, y: iconY - 6, fontSize: 10, weight: .regular, color: UIColor.white.withAlphaComponent(0.8), maxWidth: 400)
        cursorY = pageHeight - bannerH - 16

        // --- Disclaimer ---
        let disclaimerRect = CGRect(x: margin, y: cursorY - 28, width: contentWidth, height: 28)
        drawRoundedRect(disclaimerRect, fill: UIColor(red: 1.0, green: 0.97, blue: 0.92, alpha: 1), radius: 4, stroke: UIColor(red: 0.95, green: 0.85, blue: 0.65, alpha: 1))
        drawTextAt("This report is for informational purposes only. Please share with your healthcare provider for clinical interpretation.", x: margin + 10, y: cursorY - 4, fontSize: 9, weight: .medium, color: UIColor(red: 0.6, green: 0.45, blue: 0.1, alpha: 1), maxWidth: contentWidth - 20)
        cursorY -= 38

        // --- Quick Stats Row ---
        let statW = contentWidth / 4
        let statH: CGFloat = 56
        let statsY = cursorY

        let latestUA = uricAcidReadings.first
        let totalFlares = goutFlares.count
        let activeMeds = medications.filter(\.isActive).count

        let stats: [(String, String, UIColor)] = [
            ("Gout Stage", profile.goutStage.label, brandBlue),
            ("Latest UA", latestUA.map { String(format: "%.1f mg/dL", $0.value) } ?? "No data", latestUA.map { $0.value <= 6.0 ? greenStatus : $0.value <= 7.0 ? orangeStatus : redStatus } ?? .gray),
            ("Total Flares", "\(totalFlares)", totalFlares == 0 ? greenStatus : redStatus),
            ("Medications", "\(activeMeds) active", brandDarkBlue),
        ]

        for (i, stat) in stats.enumerated() {
            let x = margin + CGFloat(i) * statW
            drawRoundedRect(CGRect(x: x + 3, y: statsY - statH, width: statW - 6, height: statH), fill: lightBg, radius: 6, stroke: tableBorder)
            drawTextAt(stat.0, x: x + 10, y: statsY - 8, fontSize: 9, weight: .medium, color: .gray, maxWidth: statW - 16)
            drawTextAt(stat.1, x: x + 10, y: statsY - 22, fontSize: 14, weight: .bold, color: stat.2, maxWidth: statW - 16)
        }
        cursorY = statsY - statH - 4

        // --- Patient Profile ---
        drawSectionHeader("Patient Profile")
        cursorY -= 4
        let profileItems = [
            ("Gout Stage", profile.goutStage.label),
            ("Daily Purine Target", "\(profile.purineTarget) mg"),
            ("Daily Water Goal", "\(profile.waterGoal) oz"),
            ("Days Since Last Flare", daysSinceLastFlare.map { "\($0) days" } ?? "No flares recorded"),
        ]
        for (i, item) in profileItems.enumerated() {
            let rowY = cursorY
            let bg: UIColor? = i % 2 == 0 ? lightBg : nil
            if let bg = bg {
                drawRect(CGRect(x: margin, y: rowY - 18, width: contentWidth, height: 20), fill: bg)
            }
            drawTextAt(item.0, x: margin + 8, y: rowY, fontSize: 10, weight: .medium, color: .gray, maxWidth: 200)
            drawTextAt(item.1, x: margin + 200, y: rowY, fontSize: 10, weight: .semibold, color: .black, maxWidth: 300)
            cursorY -= 20
        }

        // --- Medications ---
        drawSectionHeader("Current Medications")
        cursorY -= 4
        if medications.isEmpty {
            drawText("No medications listed", x: margin + 8, fontSize: 10, color: .gray)
            cursorY -= 4
        } else {
            for (i, med) in medications.enumerated() where med.isActive {
                checkPageBreak(24)
                let bg: UIColor? = i % 2 == 0 ? lightBg : nil
                if let bg = bg {
                    drawRect(CGRect(x: margin, y: cursorY - 18, width: contentWidth, height: 20), fill: bg)
                }
                drawTextAt(med.name, x: margin + 8, y: cursorY, fontSize: 10, weight: .semibold, maxWidth: 200)
                drawTextAt(med.dosage.isEmpty ? "—" : med.dosage, x: margin + 200, y: cursorY, fontSize: 10, color: .darkGray, maxWidth: 300)
                cursorY -= 20
            }
        }

        // --- Uric Acid Table ---
        drawSectionHeader("Uric Acid History")
        cursorY -= 2
        if uricAcidReadings.isEmpty {
            drawText("No readings recorded", x: margin + 8, fontSize: 10, color: .gray)
            cursorY -= 4
        } else {
            // Column widths
            let col1: CGFloat = 160 // Date
            let col2: CGFloat = 120 // Value
            let col3: CGFloat = 100 // Status
            let col4 = contentWidth - col1 - col2 - col3 // Notes
            let rowH: CGFloat = 22

            // Table header row
            let headerBg = brandBlue.withAlphaComponent(0.1)
            drawRect(CGRect(x: margin, y: cursorY - rowH + 4, width: contentWidth, height: rowH), fill: headerBg)
            // Top border
            context.setStrokeColor(brandBlue.withAlphaComponent(0.3).cgColor)
            context.setLineWidth(1)
            context.move(to: CGPoint(x: margin, y: cursorY + 4))
            context.addLine(to: CGPoint(x: margin + contentWidth, y: cursorY + 4))
            context.strokePath()

            drawTableRow(columns: [("Date", col1), ("Value (mg/dL)", col2), ("Status", col3), ("Notes", col4)], y: cursorY, fontSize: 9, weight: .bold, color: brandDarkBlue)
            cursorY -= rowH

            // Bottom border of header
            context.setStrokeColor(tableBorder.cgColor)
            context.setLineWidth(0.5)
            context.move(to: CGPoint(x: margin, y: cursorY + 4))
            context.addLine(to: CGPoint(x: margin + contentWidth, y: cursorY + 4))
            context.strokePath()

            for (i, reading) in uricAcidReadings.prefix(25).enumerated() {
                checkPageBreak(rowH + 4)
                let status = reading.value <= 6.0 ? "Normal" : reading.value <= 7.0 ? "Elevated" : "High"
                let statusColor = reading.value <= 6.0 ? greenStatus : reading.value <= 7.0 ? orangeStatus : redStatus
                let bg: UIColor? = i % 2 == 0 ? lightBg : nil
                if let bg = bg {
                    drawRect(CGRect(x: margin, y: cursorY - rowH + 4, width: contentWidth, height: rowH), fill: bg)
                }
                var xOff = margin + 8
                drawTextAt(dateFmt.string(from: reading.date), x: xOff, y: cursorY, fontSize: 10, maxWidth: col1 - 8)
                xOff += col1
                drawTextAt(String(format: "%.1f", reading.value), x: xOff, y: cursorY, fontSize: 10, weight: .semibold, maxWidth: col2 - 8)
                xOff += col2
                // Status pill
                let pillW: CGFloat = 50
                let pillRect = CGRect(x: xOff, y: cursorY - 15, width: pillW, height: 16)
                drawRoundedRect(pillRect, fill: statusColor.withAlphaComponent(0.12), radius: 8)
                drawTextAt(status, x: xOff + 6, y: cursorY - 1, fontSize: 8, weight: .bold, color: statusColor, maxWidth: pillW - 8)
                xOff += col3
                drawTextAt(reading.notes.isEmpty ? "" : reading.notes, x: xOff, y: cursorY, fontSize: 9, color: .gray, maxWidth: col4 - 8)
                cursorY -= rowH
            }
            // Bottom border
            context.setStrokeColor(tableBorder.cgColor)
            context.move(to: CGPoint(x: margin, y: cursorY + 4))
            context.addLine(to: CGPoint(x: margin + contentWidth, y: cursorY + 4))
            context.strokePath()

            if uricAcidReadings.count > 25 {
                cursorY -= 4
                drawText("  + \(uricAcidReadings.count - 25) more readings", x: margin, fontSize: 9, color: .gray)
            }
        }

        // --- Gout Flares ---
        drawSectionHeader("Gout Flare History")
        cursorY -= 4
        if goutFlares.isEmpty {
            drawText("No flares recorded", x: margin + 8, fontSize: 10, color: .gray)
            cursorY -= 4
        } else {
            for (i, flare) in goutFlares.prefix(20).enumerated() {
                checkPageBreak(70)
                let joints = flare.joints.map(\.label).joined(separator: ", ")
                let cardH: CGFloat = 52 + (flare.triggers.isEmpty ? 0 : 14) + (flare.treatments.isEmpty ? 0 : 14)
                let cardY = cursorY

                // Card background
                let cardBg = i % 2 == 0 ? lightBg : UIColor.white
                drawRoundedRect(CGRect(x: margin, y: cardY - cardH, width: contentWidth, height: cardH), fill: cardBg, radius: 4, stroke: tableBorder)

                // Pain indicator dot
                let painColor = flare.painLevel <= 3 ? greenStatus : flare.painLevel <= 6 ? orangeStatus : redStatus
                context.saveGState()
                context.setFillColor(painColor.cgColor)
                context.fillEllipse(in: CGRect(x: margin + 10, y: cardY - 16, width: 8, height: 8))
                context.restoreGState()

                drawTextAt(dateFmt.string(from: flare.date), x: margin + 24, y: cardY - 4, fontSize: 11, weight: .semibold, maxWidth: 200)
                drawTextAt("Pain: \(flare.painLevel)/10", x: margin + contentWidth - 108, y: cardY - 4, fontSize: 11, weight: .bold, color: painColor, maxWidth: 100)

                var detailY = cardY - 20
                drawTextAt("Joints: \(joints)", x: margin + 24, y: detailY, fontSize: 9, color: .darkGray, maxWidth: contentWidth - 40)
                detailY -= 14
                if !flare.triggers.isEmpty {
                    drawTextAt("Triggers: \(flare.triggers.map(\.label).joined(separator: ", "))", x: margin + 24, y: detailY, fontSize: 9, color: .darkGray, maxWidth: contentWidth - 40)
                    detailY -= 14
                }
                if !flare.treatments.isEmpty {
                    drawTextAt("Treatments: \(flare.treatments.map(\.label).joined(separator: ", "))", x: margin + 24, y: detailY, fontSize: 9, color: brandBlue, maxWidth: contentWidth - 40)
                }

                cursorY -= cardH + 4
            }
            if goutFlares.count > 20 {
                drawText("  + \(goutFlares.count - 20) more flares", x: margin, fontSize: 9, color: .gray)
            }
        }

        // --- Food Log ---
        drawSectionHeader("Recent Food Log (Last 7 Days)")
        cursorY -= 4
        var hasFood = false
        for dayOffset in 0..<7 {
            guard let date = Calendar.current.date(byAdding: .day, value: -dayOffset, to: Date()) else { continue }
            let log = getDailyLog(for: date)
            if log.foods.isEmpty { continue }
            hasFood = true
            checkPageBreak(40)

            // Day header
            let dayHeaderRect = CGRect(x: margin, y: cursorY - 18, width: contentWidth, height: 20)
            drawRoundedRect(dayHeaderRect, fill: brandBlue.withAlphaComponent(0.06), radius: 4)
            drawTextAt(dateFmt.string(from: date), x: margin + 8, y: cursorY, fontSize: 10, weight: .bold, color: brandDarkBlue, maxWidth: 200)
            drawTextAt("Total: \(log.totalPurine) mg purine", x: margin + contentWidth - 158, y: cursorY, fontSize: 10, weight: .bold, color: log.totalPurine > profile.purineTarget ? redStatus : greenStatus, maxWidth: 150)
            cursorY -= 24

            for (fi, food) in log.foods.enumerated() {
                checkPageBreak(20)
                let bg: UIColor? = fi % 2 == 0 ? lightBg : nil
                if let bg = bg {
                    drawRect(CGRect(x: margin + 8, y: cursorY - 16, width: contentWidth - 16, height: 18), fill: bg)
                }
                drawTextAt(food.name, x: margin + 16, y: cursorY, fontSize: 9, weight: .medium, maxWidth: 250)
                drawTextAt(food.servingSize, x: margin + 270, y: cursorY, fontSize: 9, color: .gray, maxWidth: 120)
                drawTextAt("\(food.purineContent) mg", x: margin + contentWidth - 68, y: cursorY, fontSize: 9, weight: .semibold, maxWidth: 60)
                cursorY -= 18
            }
            cursorY -= 6
        }
        if !hasFood {
            drawText("No food entries in the last 7 days", x: margin + 8, fontSize: 10, color: .gray)
        }

        endCurrentPage()
        context.closePDF()

        return pdfData as Data
    }

    func clearAllData() {
        for key in defaults.dictionaryRepresentation().keys where key.hasPrefix("gc_") {
            defaults.removeObject(forKey: key)
        }
        profile = UserProfile()
        subscription = SubscriptionStatus()
        medications = []
        uricAcidReadings = []
        goutFlares = []
        reminderSettings = ReminderSettings()
        cancelAllNotifications()
    }

    // MARK: - Reminders

    func updateReminders(_ update: (inout ReminderSettings) -> Void) {
        update(&reminderSettings)
        save(reminderSettings, key: "gc_reminders")
        scheduleAllNotifications()
    }

    func requestNotificationPermission(completion: @escaping (Bool) -> Void) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            DispatchQueue.main.async {
                self.updateProfile { $0.notificationsEnabled = granted }
                completion(granted)
            }
        }
    }

    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }

    func scheduleAllNotifications() {
        cancelAllNotifications()
        let center = UNUserNotificationCenter.current()

        // Water reminders
        if reminderSettings.waterEnabled {
            let startParts = reminderSettings.waterStartTime.split(separator: ":").compactMap { Int($0) }
            let endParts = reminderSettings.waterEndTime.split(separator: ":").compactMap { Int($0) }
            guard startParts.count == 2, endParts.count == 2 else { return }

            let startHour = startParts[0]
            let endHour = endParts[0]
            var hour = startHour
            var idx = 0
            while hour <= endHour {
                let content = UNMutableNotificationContent()
                content.title = "Time to Hydrate"
                content.body = "Drink some water to help flush uric acid and prevent flares."
                content.sound = .default

                var dateComponents = DateComponents()
                dateComponents.hour = hour
                dateComponents.minute = 0
                let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
                let request = UNNotificationRequest(identifier: "water_\(idx)", content: content, trigger: trigger)
                center.add(request)
                hour += reminderSettings.waterIntervalHours
                idx += 1
            }
        }

        // Meal reminders
        if reminderSettings.mealsEnabled {
            let meals = [
                ("breakfast", reminderSettings.breakfastTime, "Log Your Breakfast", "Track your morning purine intake."),
                ("lunch", reminderSettings.lunchTime, "Log Your Lunch", "Don't forget to log your midday meal."),
                ("dinner", reminderSettings.dinnerTime, "Log Your Dinner", "Track your evening purine intake.")
            ]
            for (id, time, title, body) in meals {
                let parts = time.split(separator: ":").compactMap { Int($0) }
                guard parts.count == 2 else { continue }
                let content = UNMutableNotificationContent()
                content.title = title
                content.body = body
                content.sound = .default

                var dateComponents = DateComponents()
                dateComponents.hour = parts[0]
                dateComponents.minute = parts[1]
                let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
                let request = UNNotificationRequest(identifier: "meal_\(id)", content: content, trigger: trigger)
                center.add(request)
            }
        }

        // Medication reminders
        if reminderSettings.medicationEnabled {
            for (i, time) in reminderSettings.medicationTimes.enumerated() {
                let parts = time.split(separator: ":").compactMap { Int($0) }
                guard parts.count == 2 else { continue }
                let content = UNMutableNotificationContent()
                content.title = "Medication Reminder"
                content.body = "Time to take your medication (Dose \(i + 1))."
                content.sound = .default

                var dateComponents = DateComponents()
                dateComponents.hour = parts[0]
                dateComponents.minute = parts[1]
                let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
                let request = UNNotificationRequest(identifier: "med_\(i)", content: content, trigger: trigger)
                center.add(request)
            }
        }

        // Uric acid check reminder
        if reminderSettings.uricAcidEnabled {
            let parts = reminderSettings.uricAcidTime.split(separator: ":").compactMap { Int($0) }
            guard parts.count == 2 else { return }
            let content = UNMutableNotificationContent()
            content.title = "Uric Acid Check"
            content.body = "Time to test and log your uric acid level."
            content.sound = .default

            var dateComponents = DateComponents()
            dateComponents.hour = parts[0]
            dateComponents.minute = parts[1]
            if reminderSettings.uricAcidFrequency == "weekly" {
                dateComponents.weekday = reminderSettings.uricAcidDay + 1 // iOS weekday is 1-based, Sunday=1
            } else {
                dateComponents.day = reminderSettings.uricAcidDay
            }
            let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
            let request = UNNotificationRequest(identifier: "uric_acid", content: content, trigger: trigger)
            center.add(request)
        }
    }

    // MARK: - Helpers

    private func save<T: Encodable>(_ value: T, key: String) {
        if let data = try? encoder.encode(value) {
            defaults.set(data, forKey: key)
        }
    }

    private static func load<T: Decodable>(_ key: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }
}
