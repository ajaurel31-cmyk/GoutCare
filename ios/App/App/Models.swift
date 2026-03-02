import Foundation
import SwiftUI

// MARK: - Enums

enum PurineLevel: String, Codable, CaseIterable {
    case low, moderate, high, veryHigh = "very-high"

    var label: String {
        switch self {
        case .low: return "Low"
        case .moderate: return "Moderate"
        case .high: return "High"
        case .veryHigh: return "Very High"
        }
    }

    var range: String {
        switch self {
        case .low: return "0-100 mg"
        case .moderate: return "100-200 mg"
        case .high: return "200-300 mg"
        case .veryHigh: return "300+ mg"
        }
    }

    static func from(mg: Int) -> PurineLevel {
        if mg <= 100 { return .low }
        if mg <= 200 { return .moderate }
        if mg <= 300 { return .high }
        return .veryHigh
    }
}

enum PurineCategory: String, Codable, CaseIterable {
    case meats = "Meats"
    case seafood = "Seafood"
    case vegetables = "Vegetables"
    case dairy = "Dairy"
    case grains = "Grains"
    case beverages = "Beverages"
    case fruits = "Fruits"
    case nutsSeeds = "Nuts & Seeds"
    case legumes = "Legumes"
    case condiments = "Condiments"
    case snacks = "Snacks"
    case organMeats = "Organ Meats"
    case alcohol = "Alcohol"
}

enum GoutStage: String, Codable, CaseIterable {
    case acute, intercritical, chronic

    var label: String {
        switch self {
        case .acute: return "Acute"
        case .intercritical: return "Intercritical"
        case .chronic: return "Chronic"
        }
    }

    var desc: String {
        switch self {
        case .acute: return "Currently experiencing or recently had a flare — stricter limits recommended"
        case .intercritical: return "Between flares, managing to prevent next one"
        case .chronic: return "Long-term, frequent flares — tighter management recommended"
        }
    }

    var recommendedPurineTarget: Int {
        switch self {
        case .acute: return 300
        case .intercritical: return 400
        case .chronic: return 350
        }
    }

    var recommendedWaterGoal: Int {
        switch self {
        case .acute: return 80
        case .intercritical: return 64
        case .chronic: return 72
        }
    }

    var tip: String {
        switch self {
        case .acute: return "Stricter purine limit and higher hydration during active flares"
        case .intercritical: return "Standard targets for maintenance between flares"
        case .chronic: return "Tighter management to reduce frequent flares"
        }
    }
}

enum Joint: String, Codable, CaseIterable, Identifiable {
    case bigToe = "big-toe"
    case ankle, knee, wrist, finger, elbow, other

    var id: String { rawValue }

    var label: String {
        switch self {
        case .bigToe: return "Big Toe"
        case .ankle: return "Ankle"
        case .knee: return "Knee"
        case .wrist: return "Wrist"
        case .finger: return "Finger"
        case .elbow: return "Elbow"
        case .other: return "Other"
        }
    }
}

enum Trigger: String, Codable, CaseIterable, Identifiable {
    case food, alcohol, dehydration, stress, injury
    case medicationChange = "medication-change"
    case weather, other

    var id: String { rawValue }

    var label: String {
        switch self {
        case .food: return "Food"
        case .alcohol: return "Alcohol"
        case .dehydration: return "Dehydration"
        case .stress: return "Stress"
        case .injury: return "Injury"
        case .medicationChange: return "Medication Change"
        case .weather: return "Weather"
        case .other: return "Other"
        }
    }
}

enum Treatment: String, Codable, CaseIterable, Identifiable {
    case colchicine, nsaids, prednisone, ice, rest, elevation, other

    var id: String { rawValue }

    var label: String {
        switch self {
        case .colchicine: return "Colchicine"
        case .nsaids: return "NSAIDs"
        case .prednisone: return "Prednisone"
        case .ice: return "Ice"
        case .rest: return "Rest"
        case .elevation: return "Elevation"
        case .other: return "Other"
        }
    }
}

// MARK: - Data Models

struct FoodItem: Identifiable, Codable {
    let id: String
    let name: String
    let category: PurineCategory
    let purineContent: Int
    let purineLevel: PurineLevel
    let servingSize: String
    var description: String?
    var warnings: [String]?
}

struct FoodEntry: Identifiable, Codable {
    let id: String
    let foodId: String
    let name: String
    let servingSize: String
    let purineContent: Int
    let timestamp: Date

    init(foodId: String = "", name: String, servingSize: String, purineContent: Int, timestamp: Date = Date()) {
        self.id = UUID().uuidString
        self.foodId = foodId
        self.name = name
        self.servingSize = servingSize
        self.purineContent = purineContent
        self.timestamp = timestamp
    }
}

struct DailyLog: Codable {
    let date: String
    var foods: [FoodEntry]
    var totalPurine: Int

    init(date: String) {
        self.date = date
        self.foods = []
        self.totalPurine = 0
    }
}

struct UricAcidReading: Identifiable, Codable {
    let id: String
    let date: Date
    let value: Double
    let notes: String

    init(date: Date, value: Double, notes: String = "") {
        self.id = UUID().uuidString
        self.date = date
        self.value = value
        self.notes = notes
    }
}

struct GoutFlare: Identifiable, Codable {
    let id: String
    let date: Date
    let joints: [Joint]
    let painLevel: Int
    let durationHours: Int
    let durationDays: Int
    let triggers: [Trigger]
    let treatments: [Treatment]
    let notes: String

    init(date: Date, joints: [Joint], painLevel: Int, durationHours: Int = 0, durationDays: Int = 0, triggers: [Trigger] = [], treatments: [Treatment] = [], notes: String = "") {
        self.id = UUID().uuidString
        self.date = date
        self.joints = joints
        self.painLevel = painLevel
        self.durationHours = durationHours
        self.durationDays = durationDays
        self.triggers = triggers
        self.treatments = treatments
        self.notes = notes
    }
}

struct WaterEntry: Identifiable, Codable {
    let id: String
    let amount: Int
    let timestamp: Date

    init(amount: Int) {
        self.id = UUID().uuidString
        self.amount = amount
        self.timestamp = Date()
    }
}

struct Medication: Identifiable, Codable {
    let id: String
    var name: String
    var dosage: String
    var isActive: Bool

    init(name: String, dosage: String) {
        self.id = UUID().uuidString
        self.name = name
        self.dosage = dosage
        self.isActive = true
    }
}

struct UserProfile: Codable {
    var goutStage: GoutStage
    var purineTarget: Int
    var waterGoal: Int
    var theme: String
    var onboardingComplete: Bool
    var notificationsEnabled: Bool

    init() {
        self.goutStage = .intercritical
        self.purineTarget = 400
        self.waterGoal = 64
        self.theme = "dark"
        self.onboardingComplete = false
        self.notificationsEnabled = false
    }
}

struct SubscriptionStatus: Codable {
    var isActive: Bool
    var plan: String
    var expiresAt: String?
    var isTrial: Bool

    init(isActive: Bool = false, plan: String = "free", expiresAt: String? = nil, isTrial: Bool = false) {
        self.isActive = isActive
        self.plan = plan
        self.expiresAt = expiresAt
        self.isTrial = isTrial
    }
}

struct ScanResult: Codable {
    let foods: [String]
    let purineLevel: PurineLevel
    let estimatedPurine: Int
    let explanation: String
    let alternatives: [String]
    let safetyDuringFlare: String
    let riskFactors: [String]
    let benefits: [String]

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        // foods: accept array of strings, or single string
        if let arr = try? container.decode([String].self, forKey: .foods) {
            foods = arr
        } else if let single = try? container.decode(String.self, forKey: .foods) {
            foods = [single]
        } else {
            foods = []
        }

        // purineLevel: AI may return "very-high", "Very High", "very_high", "veryHigh", etc.
        if let level = try? container.decode(PurineLevel.self, forKey: .purineLevel) {
            purineLevel = level
        } else if let raw = try? container.decode(String.self, forKey: .purineLevel) {
            let normalized = raw.lowercased().trimmingCharacters(in: .whitespaces)
            if normalized == "very-high" || normalized == "very high" || normalized == "very_high" || normalized == "veryhigh" {
                purineLevel = .veryHigh
            } else if normalized == "high" {
                purineLevel = .high
            } else if normalized == "moderate" || normalized == "medium" {
                purineLevel = .moderate
            } else {
                purineLevel = .low
            }
        } else {
            purineLevel = .low
        }

        // estimatedPurine: AI may return as Double (150.0) or String ("150")
        if let intVal = try? container.decode(Int.self, forKey: .estimatedPurine) {
            estimatedPurine = intVal
        } else if let doubleVal = try? container.decode(Double.self, forKey: .estimatedPurine) {
            estimatedPurine = Int(doubleVal)
        } else if let strVal = try? container.decode(String.self, forKey: .estimatedPurine),
                  let parsed = Int(strVal) ?? Int(Double(strVal) ?? 0) as Int? {
            estimatedPurine = parsed
        } else {
            estimatedPurine = 0
        }

        explanation = (try? container.decode(String.self, forKey: .explanation)) ?? ""
        alternatives = (try? container.decode([String].self, forKey: .alternatives)) ?? []
        safetyDuringFlare = (try? container.decode(String.self, forKey: .safetyDuringFlare)) ?? ""
        riskFactors = (try? container.decode([String].self, forKey: .riskFactors)) ?? []
        benefits = (try? container.decode([String].self, forKey: .benefits)) ?? []
    }

    private enum CodingKeys: String, CodingKey {
        case foods, purineLevel, estimatedPurine, explanation, alternatives
        case safetyDuringFlare, riskFactors, benefits
    }
}

// MARK: - Drug Interactions

struct DrugInteraction {
    let medication: String
    let interactions: [String]
}

let drugInteractions: [DrugInteraction] = [
    DrugInteraction(medication: "Colchicine", interactions: [
        "Avoid alcohol (increases risk of liver damage)",
        "Avoid grapefruit juice (may increase colchicine levels)"
    ]),
    DrugInteraction(medication: "Allopurinol", interactions: [
        "Take with food (reduces stomach upset)",
        "Avoid alcohol (may reduce effectiveness)"
    ]),
    DrugInteraction(medication: "Febuxostat", interactions: [
        "Avoid alcohol (may worsen liver function)",
        "May interact with azathioprine and mercaptopurine"
    ]),
    DrugInteraction(medication: "Prednisone", interactions: [
        "Avoid alcohol (increases risk of stomach bleeding)",
        "Take with food (reduces stomach irritation)"
    ]),
    DrugInteraction(medication: "Indomethacin", interactions: [
        "Avoid alcohol (increases risk of stomach bleeding)",
        "Take with food or milk"
    ]),
    DrugInteraction(medication: "Naproxen", interactions: [
        "Avoid alcohol (increases risk of stomach bleeding)",
        "Do not take with other NSAIDs"
    ]),
    DrugInteraction(medication: "Ibuprofen", interactions: [
        "Avoid alcohol (increases risk of stomach bleeding)",
        "Do not take with other NSAIDs"
    ]),
]

let medicationPresets = ["Allopurinol", "Febuxostat", "Colchicine", "Indomethacin", "Naproxen", "Ibuprofen", "Prednisone", "Probenecid", "Pegloticase"]

// MARK: - Theme
enum AppTheme: String, Codable, CaseIterable {
    case dark, light, system

    var label: String {
        switch self {
        case .dark: return "Dark"
        case .light: return "Light"
        case .system: return "System"
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .dark: return .dark
        case .light: return .light
        case .system: return nil
        }
    }
}

// MARK: - Reminder Settings
struct ReminderSettings: Codable {
    var waterEnabled: Bool
    var waterIntervalHours: Int
    var waterStartTime: String
    var waterEndTime: String

    var mealsEnabled: Bool
    var breakfastTime: String
    var lunchTime: String
    var dinnerTime: String

    var medicationEnabled: Bool
    var medicationTimes: [String]

    var uricAcidEnabled: Bool
    var uricAcidFrequency: String // "weekly" or "monthly"
    var uricAcidDay: Int
    var uricAcidTime: String

    init() {
        self.waterEnabled = false
        self.waterIntervalHours = 2
        self.waterStartTime = "08:00"
        self.waterEndTime = "21:00"
        self.mealsEnabled = false
        self.breakfastTime = "08:00"
        self.lunchTime = "12:00"
        self.dinnerTime = "18:30"
        self.medicationEnabled = false
        self.medicationTimes = ["09:00"]
        self.uricAcidEnabled = false
        self.uricAcidFrequency = "weekly"
        self.uricAcidDay = 1
        self.uricAcidTime = "09:00"
    }
}

// MARK: - Constants
struct Constants {
    static let freeScanLimit = 3
    static let defaultPurineTarget = 400
    static let defaultWaterGoal = 64
    static let uricAcidTarget = 6.0
}

// MARK: - Helpers
extension Date {
    var dateKey: String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: self)
    }

    var relativeString: String {
        let cal = Calendar.current
        if cal.isDateInToday(self) { return "Today" }
        if cal.isDateInYesterday(self) { return "Yesterday" }
        let days = cal.dateComponents([.day], from: self, to: Date()).day ?? 0
        if days < 7 { return "\(days) days ago" }
        let f = DateFormatter()
        f.dateFormat = "MMM d, yyyy"
        return f.string(from: self)
    }

    var timeString: String {
        let f = DateFormatter()
        f.dateFormat = "h:mm a"
        return f.string(from: self)
    }
}
