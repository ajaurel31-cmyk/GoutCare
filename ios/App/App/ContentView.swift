import SwiftUI

struct ContentView: View {
    @EnvironmentObject var store: DataStore
    @State private var selectedTab = 0

    var body: some View {
        Group {
            if !store.profile.onboardingComplete {
                OnboardingView()
            } else {
                mainTabView
            }
        }
    }

    private var mainTabView: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)

            ScannerView()
                .tabItem {
                    Image(systemName: "camera.fill")
                    Text("Scan")
                }
                .tag(1)

            DatabaseView()
                .tabItem {
                    Image(systemName: "fork.knife")
                    Text("Foods")
                }
                .tag(2)

            TrackerView()
                .tabItem {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                    Text("Tracker")
                }
                .tag(3)

            SettingsView()
                .tabItem {
                    Image(systemName: "gearshape.fill")
                    Text("Settings")
                }
                .tag(4)
        }
        .tint(GC.accent)
        .onAppear {
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(GC.bgCard)

            let normal = UIColor(GC.textTertiary)
            let selected = UIColor(GC.accent)
            appearance.stackedLayoutAppearance.normal.iconColor = normal
            appearance.stackedLayoutAppearance.normal.titleTextAttributes = [.foregroundColor: normal]
            appearance.stackedLayoutAppearance.selected.iconColor = selected
            appearance.stackedLayoutAppearance.selected.titleTextAttributes = [.foregroundColor: selected]

            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}
