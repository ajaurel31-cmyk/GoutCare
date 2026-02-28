import Foundation
import Combine
import SwiftUI
import UserNotifications

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
    @Published var reminderSettings: ReminderSettings

    init() {
        self.profile = Self.load("gc_profile") ?? UserProfile()
        self.subscription = Self.load("gc_subscription") ?? SubscriptionStatus()
        self.medications = Self.load("gc_medications") ?? []
        self.uricAcidReadings = Self.load("gc_uric_acid") ?? []
        self.goutFlares = Self.load("gc_flares") ?? []
        self.reminderSettings = Self.load("gc_reminders") ?? ReminderSettings()
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
        let expString = ISO8601DateFormatter().string(from: exp)
        subscription = SubscriptionStatus(
            isActive: true,
            plan: "trial",
            expiresAt: expString,
            isTrial: true
        )
        save(subscription, key: "gc_subscription")
        updateProfile { $0.onboardingComplete = true }
    }

    func activateSubscription(plan: String) {
        let exp = Calendar.current.date(byAdding: plan == "annual" ? .year : .month, value: 1, to: Date())!
        let expString = ISO8601DateFormatter().string(from: exp)
        subscription = SubscriptionStatus(
            isActive: true,
            plan: plan,
            expiresAt: expString,
            isTrial: false
        )
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
