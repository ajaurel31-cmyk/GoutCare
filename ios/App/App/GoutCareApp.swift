import SwiftUI

@main
struct GoutCareApp: App {
    @StateObject private var store = DataStore.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .preferredColorScheme(store.activeColorScheme)
        }
    }
}
