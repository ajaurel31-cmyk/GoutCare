import SwiftUI

struct PrivacyPolicyView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    Text("Last updated: February 2026")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(GC.text)
                        .padding(.bottom, 16)

                    section(number: 1, title: "Introduction")
                    paragraph("GoutCare (\"we\", \"our\", or \"the App\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.")

                    section(number: 2, title: "Information We Collect")
                    subheading("2.1 Health Data You Provide")
                    paragraph("The App allows you to enter health-related information including uric acid readings, gout flare details, food consumption logs, water intake, and medication schedules. This data is stored locally on your device and is not transmitted to our servers.")
                    subheading("2.2 Food Images")
                    paragraph("When you use the AI food scanning feature, images of food are sent to our AI analysis service (powered by Anthropic's Claude) for purine content estimation. These images are processed in real-time and are not stored permanently on our servers.")
                    subheading("2.3 Device Information")
                    paragraph("We may collect basic device information (device type, operating system version) for app compatibility and performance purposes.")

                    section(number: 3, title: "How We Use Your Information")
                    bulletList([
                        "To provide and maintain the App's functionality",
                        "To analyze food images for purine content estimation",
                        "To send local notifications for medication and hydration reminders (with your permission)",
                        "To improve the App's features and user experience"
                    ])

                    section(number: 4, title: "Data Storage")
                    paragraph("All personal health data (uric acid readings, flare logs, food logs, medication schedules, hydration tracking) is stored exclusively on your device using local storage. We do not have access to this data. If you clear your app data or uninstall the App, this data will be permanently deleted.")

                    section(number: 5, title: "Data Sharing")
                    paragraph("We do not sell, trade, or otherwise transfer your personal information to third parties. Food images sent for AI analysis are processed by Anthropic's API service and are subject to Anthropic's privacy policy. No other personal data is shared with third parties.")

                    section(number: 6, title: "Camera and Photo Access")
                    paragraph("The App requests access to your device camera and photo library solely for the purpose of capturing or selecting food images for AI purine analysis. Camera access is optional and only used when you initiate a food scan.")

                    section(number: 7, title: "Notifications")
                    paragraph("The App may request permission to send local notifications for medication reminders, hydration reminders, and other health tracking reminders. You can manage notification permissions in your device settings at any time.")

                    section(number: 8, title: "Children's Privacy")
                    paragraph("GoutCare is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete it.")

                    section(number: 9, title: "Your Rights")
                    paragraph("Since your health data is stored locally on your device, you have full control over it. You can delete all your data at any time through the Settings page in the App. You can also delete all app data by uninstalling the App from your device.")

                    section(number: 10, title: "Security")
                    paragraph("We take reasonable measures to protect the information processed through our services. However, no electronic transmission or storage method is 100% secure. Your locally stored data is protected by your device's built-in security features.")

                    section(number: 11, title: "Changes to This Policy")
                    paragraph("We may update this Privacy Policy from time to time. Changes will be posted within the App and the \"Last updated\" date will be revised. Your continued use of the App after changes are posted constitutes acceptance of the updated policy.")

                    section(number: 12, title: "Contact Us")
                    paragraph("If you have questions or concerns about this Privacy Policy, please contact us at support@goutcare.app.")
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
            .background(GC.bg.ignoresSafeArea())
            .navigationTitle("Privacy Policy")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                        .foregroundColor(GC.accent)
                }
            }
            .toolbarColorScheme(.dark, for: .navigationBar)
        }
    }

    private func section(number: Int, title: String) -> some View {
        Text("\(number). \(title)")
            .font(.system(size: 16, weight: .bold))
            .foregroundColor(GC.text)
            .padding(.top, 24)
            .padding(.bottom, 8)
    }

    private func subheading(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 14, weight: .bold))
            .foregroundColor(GC.text)
            .padding(.top, 12)
            .padding(.bottom, 6)
    }

    private func paragraph(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 14))
            .foregroundColor(GC.textSecondary)
            .lineSpacing(4)
            .padding(.bottom, 12)
    }

    private func bulletList(_ items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            ForEach(items, id: \.self) { item in
                HStack(alignment: .top, spacing: 8) {
                    Text("\u{2022}")
                        .font(.system(size: 14))
                        .foregroundColor(GC.textSecondary)
                    Text(item)
                        .font(.system(size: 14))
                        .foregroundColor(GC.textSecondary)
                        .lineSpacing(4)
                }
            }
        }
        .padding(.bottom, 16)
    }
}
