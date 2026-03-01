import SwiftUI
import StoreKit

// MARK: - Onboarding
struct OnboardingView: View {
    @EnvironmentObject var store: DataStore
    @State private var selectedPlan = "monthly"
    @State private var isPurchasing = false
    @State private var isRestoring = false
    @State private var errorMessage: String?
    @State private var showPrivacy = false
    @State private var showTerms = false
    @State private var showEULA = false

    private var storeManager: StoreManager { store.storeManager }
    private var trialEligible: Bool { storeManager.isEligibleForTrial }

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
                        if let monthly = storeManager.monthlyProduct {
                            PlanCard(
                                title: "Monthly",
                                price: storeManager.priceWithPeriod(for: monthly),
                                desc: trialEligible ? "7-day free trial, then billed monthly" : "Billed monthly, auto-renews",
                                isSelected: selectedPlan == "monthly",
                                badge: trialEligible ? "Free Trial" : nil
                            ) { selectedPlan = "monthly" }
                        } else {
                            PlanCard(
                                title: "Monthly",
                                price: "$4.99/mo",
                                desc: trialEligible ? "7-day free trial, then billed monthly" : "Billed monthly, auto-renews",
                                isSelected: selectedPlan == "monthly",
                                badge: trialEligible ? "Free Trial" : nil
                            ) { selectedPlan = "monthly" }
                        }

                        if let annual = storeManager.annualProduct {
                            PlanCard(
                                title: "Annual",
                                price: storeManager.priceWithPeriod(for: annual),
                                desc: "Billed annually, auto-renews",
                                isSelected: selectedPlan == "annual",
                                badge: "Save 50%"
                            ) { selectedPlan = "annual" }
                        } else {
                            PlanCard(
                                title: "Annual",
                                price: "$29.99/yr",
                                desc: "Billed annually, auto-renews",
                                isSelected: selectedPlan == "annual",
                                badge: "Save 50%"
                            ) { selectedPlan = "annual" }
                        }
                    }

                    if let error = errorMessage {
                        Text(error)
                            .font(.system(size: 13))
                            .foregroundColor(GC.danger)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.horizontal, 24)
            }

            // CTA
            VStack(spacing: 12) {
                Button {
                    handlePurchase()
                } label: {
                    if isPurchasing {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text(trialEligible && selectedPlan == "monthly" ? "Start Free Trial" : "Subscribe Now")
                    }
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(isPurchasing || isRestoring)

                Button {
                    handleRestore()
                } label: {
                    if isRestoring {
                        HStack(spacing: 6) {
                            ProgressView().tint(GC.textSecondary)
                            Text("Restoring...")
                        }
                    } else {
                        Text("Restore Purchases")
                    }
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(GC.textSecondary)
                .disabled(isPurchasing || isRestoring)

                if trialEligible && selectedPlan == "monthly" {
                    Text("7-day free trial. Then auto-renews at \(storeManager.monthlyProduct.map { storeManager.priceWithPeriod(for: $0) } ?? "$4.99/mo"). Cancel anytime.")
                        .font(.system(size: 10))
                        .foregroundColor(GC.textTertiary)
                        .multilineTextAlignment(.center)
                } else {
                    Text("Payment will be charged to your Apple ID. Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.")
                        .font(.system(size: 10))
                        .foregroundColor(GC.textTertiary)
                        .multilineTextAlignment(.center)
                }

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
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .background(GC.bg.ignoresSafeArea())
        .sheet(isPresented: $showPrivacy) { PrivacyPolicyView() }
        .sheet(isPresented: $showTerms) { TermsOfServiceView() }
        .sheet(isPresented: $showEULA) { EULAView() }
        .task {
            await storeManager.loadProducts()
        }
    }

    private func handleRestore() {
        errorMessage = nil
        isRestoring = true
        Task { @MainActor in
            await store.restorePurchases()
            isRestoring = false
            if !store.isSubscribed {
                errorMessage = "No active subscription found for this Apple ID."
            }
        }
    }

    private func handlePurchase() {
        errorMessage = nil
        isPurchasing = true
        Task { @MainActor in
            // If products haven't loaded yet, try loading them now
            if !storeManager.productsLoaded {
                await storeManager.reloadProducts()
            }

            let productID: StoreProduct = selectedPlan == "annual" ? .annual : .monthly
            guard let product = storeManager.product(for: productID) else {
                isPurchasing = false
                errorMessage = "Unable to load product. Please check your internet connection and try again."
                return
            }

            let success = await store.purchaseSubscription(product)
            isPurchasing = false
            if !success, let err = storeManager.purchaseError {
                errorMessage = err
            }
        }
    }
}

// MARK: - Paywall
struct PaywallView: View {
    @EnvironmentObject var store: DataStore
    @State private var selectedPlan = "monthly"
    @State private var isPurchasing = false
    @State private var isRestoring = false
    @State private var errorMessage: String?
    @State private var showPrivacy = false
    @State private var showTerms = false
    @State private var showEULA = false

    private var storeManager: StoreManager { store.storeManager }
    private var trialEligible: Bool { storeManager.isEligibleForTrial }

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 24) {
                    Spacer().frame(height: 40)

                    Image(systemName: "lock.fill")
                        .font(.system(size: 40))
                        .foregroundColor(GC.accent)

                    VStack(spacing: 8) {
                        Text("Unlock GoutCare")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(GC.text)
                        Text("Subscribe to access all features")
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
                        if let monthly = storeManager.monthlyProduct {
                            PlanCard(
                                title: "Monthly",
                                price: storeManager.priceWithPeriod(for: monthly),
                                desc: trialEligible ? "7-day free trial, then billed monthly" : "Billed monthly, auto-renews",
                                isSelected: selectedPlan == "monthly",
                                badge: trialEligible ? "Free Trial" : nil
                            ) { selectedPlan = "monthly" }
                        } else {
                            PlanCard(title: "Monthly", price: "$4.99/mo", desc: trialEligible ? "7-day free trial, then billed monthly" : "Billed monthly, auto-renews", isSelected: selectedPlan == "monthly", badge: trialEligible ? "Free Trial" : nil) { selectedPlan = "monthly" }
                        }

                        if let annual = storeManager.annualProduct {
                            PlanCard(
                                title: "Annual",
                                price: storeManager.priceWithPeriod(for: annual),
                                desc: "Billed annually, auto-renews",
                                isSelected: selectedPlan == "annual",
                                badge: "Save 50%"
                            ) { selectedPlan = "annual" }
                        } else {
                            PlanCard(title: "Annual", price: "$29.99/yr", desc: "Billed annually, auto-renews", isSelected: selectedPlan == "annual", badge: "Save 50%") { selectedPlan = "annual" }
                        }
                    }

                    if let error = errorMessage {
                        Text(error)
                            .font(.system(size: 13))
                            .foregroundColor(GC.danger)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.horizontal, 24)
            }

            VStack(spacing: 12) {
                Button {
                    handlePurchase()
                } label: {
                    if isPurchasing {
                        ProgressView().tint(.white)
                    } else {
                        Text(trialEligible && selectedPlan == "monthly" ? "Start Free Trial" : "Subscribe Now")
                    }
                }
                .buttonStyle(PrimaryButtonStyle())
                .disabled(isPurchasing || isRestoring)

                Button {
                    handleRestore()
                } label: {
                    if isRestoring {
                        HStack(spacing: 6) {
                            ProgressView().tint(GC.textSecondary)
                            Text("Restoring...")
                        }
                    } else {
                        Text("Restore Purchases")
                    }
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(GC.textSecondary)
                .disabled(isPurchasing || isRestoring)

                if trialEligible && selectedPlan == "monthly" {
                    Text("7-day free trial. Then auto-renews at \(storeManager.monthlyProduct.map { storeManager.priceWithPeriod(for: $0) } ?? "$4.99/mo"). Cancel anytime.")
                        .font(.system(size: 10))
                        .foregroundColor(GC.textTertiary)
                        .multilineTextAlignment(.center)
                } else {
                    Text("Payment will be charged to your Apple ID. Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.")
                        .font(.system(size: 10))
                        .foregroundColor(GC.textTertiary)
                        .multilineTextAlignment(.center)
                }

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
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 32)
        }
        .background(GC.bg.ignoresSafeArea())
        .sheet(isPresented: $showPrivacy) { PrivacyPolicyView() }
        .sheet(isPresented: $showTerms) { TermsOfServiceView() }
        .sheet(isPresented: $showEULA) { EULAView() }
        .task {
            await storeManager.loadProducts()
        }
    }

    private func handlePurchase() {
        errorMessage = nil
        isPurchasing = true
        Task { @MainActor in
            if !storeManager.productsLoaded {
                await storeManager.reloadProducts()
            }

            let productID: StoreProduct = selectedPlan == "annual" ? .annual : .monthly
            guard let product = storeManager.product(for: productID) else {
                isPurchasing = false
                errorMessage = "Unable to load product. Please check your internet connection and try again."
                return
            }

            let success = await store.purchaseSubscription(product)
            isPurchasing = false
            if !success, let err = storeManager.purchaseError {
                errorMessage = err
            }
        }
    }

    private func handleRestore() {
        errorMessage = nil
        isRestoring = true
        Task { @MainActor in
            await store.restorePurchases()
            isRestoring = false
            if !store.isSubscribed {
                errorMessage = "No active subscription found for this Apple ID."
            }
        }
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
