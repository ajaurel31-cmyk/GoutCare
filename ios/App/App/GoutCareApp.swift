import SwiftUI
import StoreKit

@main
struct GoutCareApp: App {
    @StateObject private var store = DataStore.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .environmentObject(store.storeManager)
                .preferredColorScheme(store.activeColorScheme)
                .task {
                    // Refresh subscription status on every app launch
                    await store.storeManager.updateSubscriptionStatus()
                }
        }
    }
}
