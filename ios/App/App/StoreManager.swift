import Foundation
import StoreKit

// MARK: - Product identifiers (must match App Store Connect)
enum StoreProduct: String, CaseIterable {
    case monthly = "com.goutcare.app.monthly"
    case annual  = "com.goutcare.app.annual"

    var isAnnual: Bool { self == .annual }
}

// MARK: - Store Manager (StoreKit 2)
class StoreManager: ObservableObject {
    static let shared = StoreManager()

    @Published private(set) var products: [Product] = []
    @Published private(set) var purchasedProductIDs: Set<String> = []
    @Published private(set) var purchaseError: String?
    @Published private(set) var isLoading = false
    @Published private(set) var subscriptionExpirationDate: Date?
    @Published private(set) var subscriptionRenewalState: Product.SubscriptionInfo.RenewalState?

    private var transactionListener: Task<Void, Error>?

    /// Whether products have been successfully loaded
    var productsLoaded: Bool { !products.isEmpty }

    init() {
        transactionListener = listenForTransactions()
        Task { await loadProducts() }
    }

    deinit {
        transactionListener?.cancel()
    }

    // MARK: - Products

    /// Fetch available subscription products from App Store with automatic retry
    func loadProducts() async {
        // Skip if already loaded
        if !products.isEmpty { return }

        let ids = Set(StoreProduct.allCases.map(\.rawValue))
        let maxRetries = 3

        for attempt in 1...maxRetries {
            do {
                let storeProducts = try await Product.products(for: ids)
                if !storeProducts.isEmpty {
                    products = storeProducts.sorted { $0.price < $1.price }
                    print("[StoreManager] Loaded \(storeProducts.count) products")
                    return
                } else {
                    print("[StoreManager] Attempt \(attempt): No products returned for IDs: \(ids)")
                }
            } catch {
                print("[StoreManager] Attempt \(attempt): Failed to load products: \(error)")
            }

            // Wait before retrying (1s, 2s)
            if attempt < maxRetries {
                try? await Task.sleep(nanoseconds: UInt64(attempt) * 1_000_000_000)
            }
        }

        print("[StoreManager] All \(maxRetries) attempts to load products failed. Verify StoreKit Configuration is active in Xcode scheme.")
    }

    /// Force reload products (clears cache and retries)
    func reloadProducts() async {
        products = []
        await loadProducts()
    }

    /// Get a specific product
    func product(for id: StoreProduct) -> Product? {
        products.first { $0.id == id.rawValue }
    }

    /// Monthly product
    var monthlyProduct: Product? { product(for: .monthly) }

    /// Annual product
    var annualProduct: Product? { product(for: .annual) }

    // MARK: - Purchase

    /// Purchase a product
    func purchase(_ product: Product) async -> Bool {
        isLoading = true
        purchaseError = nil

        do {
            let result = try await product.purchase()

            switch result {
            case .success(let verification):
                let transaction = try checkVerified(verification)
                await updateSubscriptionStatus()
                await transaction.finish()
                isLoading = false
                return true

            case .userCancelled:
                isLoading = false
                return false

            case .pending:
                // Transaction requires approval (e.g. Ask to Buy)
                purchaseError = "Purchase is pending approval."
                isLoading = false
                return false

            @unknown default:
                isLoading = false
                return false
            }
        } catch StoreKitError.userCancelled {
            isLoading = false
            return false
        } catch {
            purchaseError = error.localizedDescription
            isLoading = false
            return false
        }
    }

    // MARK: - Restore

    /// Restore purchases (syncs with App Store)
    func restorePurchases() async {
        isLoading = true
        purchaseError = nil
        do {
            try await AppStore.sync()
            await updateSubscriptionStatus()
        } catch {
            purchaseError = "Unable to restore purchases. Please try again."
        }
        isLoading = false
    }

    // MARK: - Subscription Status

    /// Check if user has an active subscription
    var hasActiveSubscription: Bool {
        !purchasedProductIDs.isEmpty
    }

    /// The active subscription product ID
    var activeSubscriptionID: String? {
        purchasedProductIDs.first
    }

    /// Human-readable plan name
    var activePlanName: String {
        if let id = activeSubscriptionID {
            if id == StoreProduct.annual.rawValue { return "Annual" }
            if id == StoreProduct.monthly.rawValue { return "Monthly" }
            return id
        }
        return "None"
    }

    /// Update subscription status by checking current entitlements
    func updateSubscriptionStatus() async {
        var activeIDs: Set<String> = []
        var latestExpiration: Date?
        var latestRenewalState: Product.SubscriptionInfo.RenewalState?

        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }

            if transaction.revocationDate == nil {
                activeIDs.insert(transaction.productID)

                if let expDate = transaction.expirationDate {
                    if latestExpiration == nil || expDate > latestExpiration! {
                        latestExpiration = expDate
                    }
                }
            }
        }

        // Get renewal state from subscription status
        for product in products {
            if let subscription = product.subscription {
                if let statuses = try? await subscription.status {
                    for status in statuses {
                        if case .verified(let renewalInfo) = status.renewalInfo {
                            latestRenewalState = status.state
                            _ = renewalInfo // Access to ensure verification
                        }
                    }
                }
            }
        }

        purchasedProductIDs = activeIDs
        subscriptionExpirationDate = latestExpiration
        subscriptionRenewalState = latestRenewalState
    }

    // MARK: - Manage Subscription

    /// Open system subscription management
    @MainActor
    func showManageSubscription() async {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene else { return }
        try? await AppStore.showManageSubscriptions(in: scene)
    }

    // MARK: - Transaction Listener

    /// Listen for StoreKit transaction updates (renewals, refunds, revocations)
    private func listenForTransactions() -> Task<Void, Error> {
        Task.detached { [weak self] in
            for await result in Transaction.updates {
                guard let self = self else { break }

                if case .verified(let transaction) = result {
                    await self.updateSubscriptionStatus()
                    await transaction.finish()
                } else {
                    // Verification failed — do not grant access
                    print("[StoreManager] Transaction verification failed")
                }
            }
        }
    }

    // MARK: - Verification

    /// Verify a transaction's JWS signature
    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let safe):
            return safe
        }
    }

    // MARK: - Formatting Helpers

    /// Format product price for display
    func formattedPrice(for product: Product) -> String {
        product.displayPrice
    }

    /// Format price with period for display
    func priceWithPeriod(for product: Product) -> String {
        if product.id == StoreProduct.annual.rawValue {
            return "\(product.displayPrice)/yr"
        }
        return "\(product.displayPrice)/mo"
    }

    /// Formatted expiration date
    var formattedExpirationDate: String? {
        guard let date = subscriptionExpirationDate else { return nil }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }

    /// Days until expiration
    var daysUntilExpiration: Int? {
        guard let date = subscriptionExpirationDate else { return nil }
        return Calendar.current.dateComponents([.day], from: Date(), to: date).day
    }

    /// Whether the subscription is in a billing retry / grace period
    var isInGracePeriod: Bool {
        subscriptionRenewalState == .inGracePeriod
    }

    /// Whether the subscription is in billing retry
    var isInBillingRetry: Bool {
        subscriptionRenewalState == .inBillingRetryPeriod
    }

    /// Whether renewal has been revoked
    var isRevoked: Bool {
        subscriptionRenewalState == .revoked
    }

    /// Whether the subscription has expired
    var isExpired: Bool {
        subscriptionRenewalState == .expired
    }

    /// Status string for display
    var subscriptionStatusText: String {
        if isInGracePeriod { return "Grace Period" }
        if isInBillingRetry { return "Payment Issue" }
        if isRevoked { return "Revoked" }
        if isExpired { return "Expired" }
        if hasActiveSubscription { return "Active" }
        return "None"
    }
}
