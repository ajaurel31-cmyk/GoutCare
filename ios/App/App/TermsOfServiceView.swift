import SwiftUI

struct TermsOfServiceView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    Text("Last updated: February 2026")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(GC.text)
                        .padding(.bottom, 16)

                    section(number: 1, title: "Acceptance of Terms")
                    paragraph("By downloading, installing, or using GoutCare (\"the App\"), you agree to be bound by these Terms of Service. If you do not agree, do not use the App.")

                    section(number: 2, title: "Description of Service")
                    paragraph("GoutCare is a health-tracking application that helps users monitor purine intake, log uric acid levels, track gout flares, and manage hydration. The App uses artificial intelligence to analyze food images for estimated purine content.")

                    section(number: 3, title: "Medical Disclaimer")
                    paragraph("GoutCare is not a medical device and does not provide medical advice, diagnosis, or treatment. The information provided by the App is for informational and educational purposes only. Always consult a qualified healthcare provider before making any changes to your diet, medication, or treatment plan. Do not disregard professional medical advice or delay seeking treatment because of information provided by this App.")

                    section(number: 4, title: "AI-Generated Content")
                    paragraph("The food scanning feature uses AI to estimate purine content. These estimates may not be accurate and should not be relied upon as the sole basis for dietary decisions. Purine values in the database are approximate and may vary based on preparation method, portion size, and other factors.")

                    section(number: 5, title: "Subscriptions and Payments")
                    paragraph("GoutCare offers a 7-day free trial and paid subscription plans. Subscriptions are billed through Apple's App Store. Payment will be charged to your Apple ID account at confirmation of purchase. Subscriptions automatically renew unless auto-renewal is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase.")

                    section(number: 6, title: "Free Trial")
                    paragraph("New users may be eligible for a 7-day free trial. At the end of the trial period, you must subscribe to continue using premium features. If you do not subscribe, your access to premium features will be restricted.")

                    section(number: 7, title: "User Data")
                    paragraph("Health data you enter into the App (uric acid readings, flare logs, food logs, hydration tracking) is stored locally on your device. We do not transmit your personal health data to external servers except when using the AI food scanning feature, which sends food images to our AI service for analysis. See our Privacy Policy for more details.")

                    section(number: 8, title: "Intellectual Property")
                    paragraph("All content, features, and functionality of the App are owned by GoutCare and are protected by copyright, trademark, and other intellectual property laws.")

                    section(number: 9, title: "Limitation of Liability")
                    paragraph("To the fullest extent permitted by law, GoutCare shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the App. GoutCare is not responsible for any health outcomes resulting from use of the App.")

                    section(number: 10, title: "Changes to Terms")
                    paragraph("We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting within the App. Your continued use of the App constitutes acceptance of the modified Terms.")

                    section(number: 11, title: "Termination")
                    paragraph("We may terminate or suspend your access to the App at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.")

                    section(number: 12, title: "Contact")
                    paragraph("If you have questions about these Terms, please contact us at support@goutcare.app.")
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
            .background(GC.bg.ignoresSafeArea())
            .navigationTitle("Terms of Service")
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

    private func paragraph(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 14))
            .foregroundColor(GC.textSecondary)
            .lineSpacing(4)
            .padding(.bottom, 12)
    }
}
