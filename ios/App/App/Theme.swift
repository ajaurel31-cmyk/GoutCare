import SwiftUI

// MARK: - Color Palette
struct GC {
    // Backgrounds
    static let bg = Color(hex: 0x0A0E1A)
    static let bgCard = Color(hex: 0x131829)
    static let bgCardHover = Color(hex: 0x1A2035)
    static let bgElevated = Color(hex: 0x1C2137)
    static let bgInput = Color(hex: 0x0F1424)

    // Text
    static let text = Color(hex: 0xF0F2F5)
    static let textSecondary = Color(hex: 0x8A94A6)
    static let textTertiary = Color(hex: 0x5A6478)

    // Accent
    static let accent = Color(hex: 0x3B82F6)
    static let accentHover = Color(hex: 0x2563EB)
    static let accentLight = Color(hex: 0x3B82F6).opacity(0.12)

    // Status
    static let success = Color(hex: 0x22C55E)
    static let successLight = Color(hex: 0x22C55E).opacity(0.12)
    static let warning = Color(hex: 0xF59E0B)
    static let warningLight = Color(hex: 0xF59E0B).opacity(0.12)
    static let danger = Color(hex: 0xEF4444)
    static let dangerLight = Color(hex: 0xEF4444).opacity(0.12)
    static let cyan = Color(hex: 0x06B6D4)
    static let cyanLight = Color(hex: 0x06B6D4).opacity(0.12)
    static let orange = Color(hex: 0xF97316)
    static let orangeLight = Color(hex: 0xF97316).opacity(0.12)
    static let purple = Color(hex: 0x8B5CF6)

    // Borders
    static let border = Color.white.opacity(0.06)
    static let borderStrong = Color.white.opacity(0.12)

    static func purineColor(_ level: PurineLevel) -> Color {
        switch level {
        case .low: return success
        case .moderate: return warning
        case .high: return orange
        case .veryHigh: return danger
        }
    }

    static func purineColorLight(_ level: PurineLevel) -> Color {
        switch level {
        case .low: return successLight
        case .moderate: return warningLight
        case .high: return orangeLight
        case .veryHigh: return dangerLight
        }
    }

    static func uricAcidColor(_ value: Double) -> Color {
        if value <= 6.0 { return success }
        if value <= 7.0 { return warning }
        return danger
    }
}

// MARK: - Hex Color Extension
extension Color {
    init(hex: UInt, alpha: Double = 1.0) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}

// MARK: - View Modifiers
struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(16)
            .background(GC.bgCard)
            .cornerRadius(16)
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(GC.border, lineWidth: 1))
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(GC.accent)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(GC.accent)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.clear)
            .cornerRadius(12)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.accent, lineWidth: 1.5))
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct GhostButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 13, weight: .semibold))
            .foregroundColor(configuration.isPressed ? GC.accent : GC.textSecondary)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(configuration.isPressed ? GC.accentLight : Color.clear)
            .cornerRadius(8)
    }
}

extension View {
    func card() -> some View { modifier(CardStyle()) }
}
