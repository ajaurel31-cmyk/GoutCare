import SwiftUI

// MARK: - Adaptive Color Helper
private func adaptive(dark: UInt, light: UInt) -> Color {
    Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(red: CGFloat((dark >> 16) & 0xFF) / 255,
                      green: CGFloat((dark >> 8) & 0xFF) / 255,
                      blue: CGFloat(dark & 0xFF) / 255, alpha: 1)
            : UIColor(red: CGFloat((light >> 16) & 0xFF) / 255,
                      green: CGFloat((light >> 8) & 0xFF) / 255,
                      blue: CGFloat(light & 0xFF) / 255, alpha: 1)
    })
}

private func adaptiveOpacity(dark: UInt, light: UInt, darkAlpha: CGFloat, lightAlpha: CGFloat) -> Color {
    Color(UIColor { traits in
        let hex = traits.userInterfaceStyle == .dark ? dark : light
        let alpha = traits.userInterfaceStyle == .dark ? darkAlpha : lightAlpha
        return UIColor(red: CGFloat((hex >> 16) & 0xFF) / 255,
                       green: CGFloat((hex >> 8) & 0xFF) / 255,
                       blue: CGFloat(hex & 0xFF) / 255, alpha: alpha)
    })
}

// MARK: - Color Palette
struct GC {
    // Backgrounds
    static let bg          = adaptive(dark: 0x0A0E1A, light: 0xF5F5F7)
    static let bgCard      = adaptive(dark: 0x131829, light: 0xFFFFFF)
    static let bgCardHover = adaptive(dark: 0x1A2035, light: 0xF0F0F5)
    static let bgElevated  = adaptive(dark: 0x1C2137, light: 0xFFFFFF)
    static let bgInput     = adaptive(dark: 0x0F1424, light: 0xF0F1F4)

    // Text
    static let text          = adaptive(dark: 0xF0F2F5, light: 0x1A1A2E)
    static let textSecondary = adaptive(dark: 0x8A94A6, light: 0x6B7280)
    static let textTertiary  = adaptive(dark: 0x5A6478, light: 0x9CA3AF)

    // Accent (same in both)
    static let accent      = Color(hex: 0x3B82F6)
    static let accentHover = Color(hex: 0x2563EB)
    static let accentLight = adaptiveOpacity(dark: 0x3B82F6, light: 0x3B82F6, darkAlpha: 0.12, lightAlpha: 0.10)

    // Status (same hues, light backgrounds adapt)
    static let success      = Color(hex: 0x22C55E)
    static let successLight = adaptiveOpacity(dark: 0x22C55E, light: 0x22C55E, darkAlpha: 0.12, lightAlpha: 0.10)
    static let warning      = Color(hex: 0xF59E0B)
    static let warningLight = adaptiveOpacity(dark: 0xF59E0B, light: 0xF59E0B, darkAlpha: 0.12, lightAlpha: 0.10)
    static let danger       = Color(hex: 0xEF4444)
    static let dangerLight  = adaptiveOpacity(dark: 0xEF4444, light: 0xEF4444, darkAlpha: 0.12, lightAlpha: 0.10)
    static let cyan         = Color(hex: 0x06B6D4)
    static let cyanLight    = adaptiveOpacity(dark: 0x06B6D4, light: 0x06B6D4, darkAlpha: 0.12, lightAlpha: 0.10)
    static let orange       = Color(hex: 0xF97316)
    static let orangeLight  = adaptiveOpacity(dark: 0xF97316, light: 0xF97316, darkAlpha: 0.12, lightAlpha: 0.10)
    static let purple       = Color(hex: 0x8B5CF6)

    // Borders
    static let border = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor.white.withAlphaComponent(0.06)
            : UIColor.black.withAlphaComponent(0.08)
    })
    static let borderStrong = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor.white.withAlphaComponent(0.12)
            : UIColor.black.withAlphaComponent(0.15)
    })

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
