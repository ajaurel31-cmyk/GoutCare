import Foundation
import Combine

// MARK: - DataStore (UserDefaults persistence)

class DataStore: ObservableObject {
    static let shared = DataStore()

    private let defaults = UserDefaults.standard
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    // MARK: Published State
    @Published var profile: UserProfile
    @Published var subscription: SubscriptionStatus
    @Published var medications: [Medication]
    @Published var uricAcidReadings: [UricAcidReading]
    @Published var goutFlares: [GoutFlare]

    init() {
        self.profile = Self.load("gc_profile") ?? UserProfile()
        self.subscription = Self.load("gc_subscription") ?? SubscriptionStatus()
        self.medications = Self.load("gc_medications") ?? []
        self.uricAcidReadings = Self.load("gc_uric_acid") ?? []
        self.goutFlares = Self.load("gc_flares") ?? []
    }

    // MARK: - Profile

    func updateProfile(_ update: (inout UserProfile) -> Void) {
        update(&profile)
        save(profile, key: "gc_profile")
    }

    // MARK: - Subscription

    var isSubscribed: Bool {
        subscription.isActive || isTrialActive
    }

    var isTrialActive: Bool {
        guard subscription.isTrial, let start = subscription.expiresAt else { return false }
        let fmt = ISO8601DateFormatter()
        if let exp = fmt.date(from: start) { return Date() < exp }
        return false
    }

    var trialDaysRemaining: Int {
        guard subscription.isTrial, let start = subscription.expiresAt else { return 0 }
        let fmt = ISO8601DateFormatter()
        guard let exp = fmt.date(from: start) else { return 0 }
        return max(0, Calendar.current.dateComponents([.day], from: Date(), to: exp).day ?? 0)
    }

    func startTrial() {
        let exp = Calendar.current.date(byAdding: .day, value: Constants.trialDays, to: Date())!
        subscription = SubscriptionStatus(isActive: true, plan: "trial", expiresAt: ISO8601DateFormatter().string(from: exp), isTrial: true)
        save(subscription, key: "gc_subscription")
        updateProfile { $0.onboardingComplete = true }
    }

    func activateSubscription(plan: String) {
        let exp = Calendar.current.date(byAdding: plan == "annual" ? .year : .month, value: 1, to: Date())!
        subscription = SubscriptionStatus(isActive: true, plan: plan, expiresAt: ISO8601DateFormatter().string(from: exp), isTrial: false)
        save(subscription, key: "gc_subscription")
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

    func clearAllData() {
        for key in defaults.dictionaryRepresentation().keys where key.hasPrefix("gc_") {
            defaults.removeObject(forKey: key)
        }
        profile = UserProfile()
        subscription = SubscriptionStatus()
        medications = []
        uricAcidReadings = []
        goutFlares = []
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
