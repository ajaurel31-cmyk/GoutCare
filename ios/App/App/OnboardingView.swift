import SwiftUI

// MARK: - Onboarding
struct OnboardingView: View {
    @EnvironmentObject var store: DataStore
    @State private var selectedPlan = "trial"

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 28) {
                    Spacer().frame(height: 40)

                    // Logo
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(colors: [GC.accent, Color(hex: 0x6366F1)], startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .frame(width: 80, height: 80)
                        Image(systemName: "drop.fill")
                            .font(.system(size: 36))
                            .foregroundColor(.white)
                    }

                    VStack(spacing: 8) {
                        Text("Welcome to GoutCare")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(GC.text)
                        Text("Your personal gout management companion")
                            .font(.system(size: 15))
                            .foregroundColor(GC.textSecondary)
                            .multilineTextAlignment(.center)
                    }

                    // Features
                    VStack(spacing: 14) {
                        FeatureRow(icon: "camera.fill", color: GC.accent, text: "AI-powered food scanning")
                        FeatureRow(icon: "chart.line.uptrend.xyaxis", color: GC.success, text: "Track uric acid & flares")
                        FeatureRow(icon: "fork.knife", color: GC.orange, text: "600+ food purine database")
                        FeatureRow(icon: "bell.fill", color: GC.purple, text: "Smart medication reminders")
                        FeatureRow(icon: "doc.text.fill", color: GC.cyan, text: "PDF health reports for your doctor")
                    }

                    // Plan selection
                    VStack(spacing: 12) {
                        PlanCard(
                            title: "7-Day Free Trial",
                            price: "$0.00",
                            desc: "Full access for 7 days",
                            isSelected: selectedPlan == "trial",
                            badge: nil
                        ) { selectedPlan = "trial" }

                        PlanCard(
                            title: "Monthly",
                            price: "$4.99/mo",
                            desc: "Billed monthly",
                            isSelected: selectedPlan == "monthly",
                            badge: nil
                        ) { selectedPlan = "monthly" }

                        PlanCard(
                            title: "Annual",
                            price: "$29.99/yr",
                            desc: "Billed annually",
                            isSelected: selectedPlan == "annual",
                            badge: "Save 50%"
                        ) { selectedPlan = "annual" }
                    }
                }
                .padding(.horizontal, 24)
            }

            // CTA
            VStack(spacing: 12) {
                Button {
                    if selectedPlan == "trial" {
                        store.startTrial()
                    } else {
                        store.activateSubscription(plan: selectedPlan)
                    }
                } label: {
                    Text(selectedPlan == "trial" ? "Start Free Trial" : "Subscribe Now")
                }
                .buttonStyle(PrimaryButtonStyle())

                Text("Cancel anytime. No commitment.")
                    .font(.system(size: 12))
                    .foregroundColor(GC.textTertiary)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .background(GC.bg.ignoresSafeArea())
    }
}

// MARK: - Paywall
struct PaywallView: View {
    @EnvironmentObject var store: DataStore
    @State private var selectedPlan = "monthly"

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 24) {
                    Spacer().frame(height: 40)

                    Image(systemName: "lock.fill")
                        .font(.system(size: 40))
                        .foregroundColor(GC.accent)

                    VStack(spacing: 8) {
                        Text("Your Free Trial Has Ended")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(GC.text)
                        Text("Subscribe to continue using GoutCare")
                            .font(.system(size: 15))
                            .foregroundColor(GC.textSecondary)
                    }

                    VStack(spacing: 14) {
                        FeatureRow(icon: "camera.fill", color: GC.accent, text: "Unlimited AI food scanning")
                        FeatureRow(icon: "chart.line.uptrend.xyaxis", color: GC.success, text: "Full health tracking & trends")
                        FeatureRow(icon: "bolt.fill", color: GC.orange, text: "Flare analysis & insights")
                        FeatureRow(icon: "bell.fill", color: GC.purple, text: "Smart reminders")
                        FeatureRow(icon: "doc.text.fill", color: GC.cyan, text: "PDF health reports for your doctor")
                    }

                    VStack(spacing: 12) {
                        PlanCard(title: "Monthly", price: "$4.99/mo", desc: "Billed monthly", isSelected: selectedPlan == "monthly", badge: nil) { selectedPlan = "monthly" }
                        PlanCard(title: "Annual", price: "$29.99/yr", desc: "Billed annually", isSelected: selectedPlan == "annual", badge: "Save 50%") { selectedPlan = "annual" }
                    }
                }
                .padding(.horizontal, 24)
            }

            VStack(spacing: 12) {
                Button {
                    store.activateSubscription(plan: selectedPlan)
                } label: {
                    Text("Subscribe Now")
                }
                .buttonStyle(PrimaryButtonStyle())

                Button("Restore Purchases") {
                    // StoreKit restore logic
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(GC.textSecondary)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .background(GC.bg.ignoresSafeArea())
    }
}

// MARK: - Feature Row
struct FeatureRow: View {
    let icon: String
    let color: Color
    let text: String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(color)
                .frame(width: 36, height: 36)
                .background(color.opacity(0.12))
                .clipShape(Circle())
            Text(text)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(GC.text)
            Spacer()
        }
    }
}

// MARK: - Plan Card
struct PlanCard: View {
    let title: String
    let price: String
    let desc: String
    let isSelected: Bool
    let badge: String?
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(title)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(GC.text)
                        if let badge = badge {
                            Text(badge)
                                .font(.system(size: 11, weight: .bold))
                                .foregroundColor(GC.success)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(GC.successLight)
                                .cornerRadius(10)
                        }
                    }
                    Text(desc)
                        .font(.system(size: 12))
                        .foregroundColor(GC.textTertiary)
                }
                Spacer()
                Text(price)
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(GC.accent)

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundColor(isSelected ? GC.accent : GC.textTertiary)
            }
            .padding(16)
            .background(isSelected ? GC.accentLight : GC.bgCard)
            .cornerRadius(14)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? GC.accent : GC.border, lineWidth: isSelected ? 2 : 1)
            )
        }
    }
}
