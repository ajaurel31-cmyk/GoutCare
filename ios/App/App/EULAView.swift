import SwiftUI

struct EULAView: View {
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    Text("Last updated: March 2026")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(GC.text)
                        .padding(.bottom, 16)

                    paragraph("This End User License Agreement (\u{201C}EULA\u{201D}) is a legal agreement between you (\u{201C}User\u{201D}) and GoutCare (\u{201C}Licensor\u{201D}) for the use of the GoutCare mobile application (\u{201C}Licensed Application\u{201D}). By downloading, installing, or using the Licensed Application, you agree to be bound by this EULA. If you do not agree, do not use the Licensed Application.")

                    section(number: 1, title: "License Grant")
                    paragraph("The Licensor grants you a limited, non-exclusive, non-transferable, revocable license to download, install, and use the Licensed Application on Apple-branded devices that you own or control, as permitted by the Apple App Store Terms of Service. This license does not allow you to use the Licensed Application on any device that you do not own or control, and you may not distribute or make the Licensed Application available over a network where it could be used by multiple devices at the same time.")

                    section(number: 2, title: "Scope of License")
                    paragraph("You may not copy, reverse-engineer, disassemble, attempt to derive the source code of, modify, or create derivative works of the Licensed Application, any updates, or any part thereof. Any attempt to do so is a violation of the rights of the Licensor. If you breach this restriction, you may be subject to prosecution and damages.")

                    section(number: 3, title: "Subscriptions and In-App Purchases")
                    paragraph("The Licensed Application offers auto-renewable subscription plans. Payment is charged to your Apple ID account at confirmation of purchase. Subscriptions automatically renew unless auto-renewal is turned off at least 24 hours before the end of the current billing period. Your account will be charged for renewal within 24 hours prior to the end of the current period at the rate of your selected plan. You can manage and cancel subscriptions in your Apple ID account settings. Any unused portion of a free trial period will be forfeited when you purchase a subscription.")

                    section(number: 4, title: "Medical Disclaimer")
                    paragraph("The Licensed Application is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease or health condition. The information provided, including AI-generated purine estimates, is for informational and educational purposes only. Always consult a qualified healthcare provider before making changes to your diet, medication, or treatment plan. The Licensor assumes no responsibility for any health outcomes resulting from use of the Licensed Application.")

                    section(number: 5, title: "AI-Generated Content Disclaimer")
                    paragraph("The food scanning feature uses artificial intelligence to estimate purine content from images. These estimates are approximations and may be inaccurate. The Licensor makes no warranty regarding the accuracy, reliability, or completeness of AI-generated content. Users should verify nutritional information independently and not rely solely on the Licensed Application for dietary decisions.")

                    section(number: 6, title: "Data and Privacy")
                    paragraph("Health data entered into the Licensed Application is stored locally on your device. Food images submitted for AI analysis are processed in real-time and are not permanently stored on external servers. For full details, see our Privacy Policy. You are responsible for maintaining the security of your device and your data.")

                    section(number: 7, title: "Intellectual Property")
                    paragraph("The Licensed Application, including all content, features, design, graphics, and functionality, is the property of the Licensor and is protected by copyright, trademark, and other intellectual property laws. This EULA does not grant you any rights to trademarks or service marks of the Licensor.")

                    section(number: 8, title: "Warranty Disclaimer")
                    uppercaseParagraph("THE LICENSED APPLICATION IS PROVIDED \u{201C}AS IS\u{201D} AND \u{201C}AS AVAILABLE\u{201D} WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. THE LICENSOR DOES NOT WARRANT THAT THE LICENSED APPLICATION WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.")

                    section(number: 9, title: "Limitation of Liability")
                    uppercaseParagraph("TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR USE OF OR INABILITY TO USE THE LICENSED APPLICATION; (B) ANY CONTENT OBTAINED FROM THE LICENSED APPLICATION; OR (C) UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA.")

                    section(number: 10, title: "Third-Party Services")
                    paragraph("The Licensed Application may use third-party services, including Anthropic\u{2019}s AI API for food image analysis. Your use of such third-party services is subject to their respective terms and policies. The Licensor is not responsible for the practices of any third-party services.")

                    section(number: 11, title: "Termination")
                    paragraph("This EULA is effective until terminated. Your rights under this EULA will terminate automatically without notice if you fail to comply with any of its terms. Upon termination, you must cease all use of the Licensed Application and delete all copies from your devices.")

                    section(number: 12, title: "Apple-Specific Terms")
                    paragraph("This EULA is between you and the Licensor only, and not with Apple Inc. (\u{201C}Apple\u{201D}). The Licensor, not Apple, is solely responsible for the Licensed Application and its content. Apple has no obligation to provide maintenance or support services for the Licensed Application. In the event of any failure of the Licensed Application to conform to any applicable warranty, you may notify Apple and Apple will refund the purchase price (if any) for the Licensed Application. To the maximum extent permitted by applicable law, Apple has no other warranty obligation with respect to the Licensed Application. Apple is not responsible for addressing any claims relating to the Licensed Application or your possession and use of the Licensed Application. Apple is a third-party beneficiary of this EULA and, upon your acceptance, Apple will have the right to enforce this EULA against you as a third-party beneficiary.")

                    section(number: 13, title: "Governing Law")
                    paragraph("This EULA shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.")

                    section(number: 14, title: "Changes to This EULA")
                    paragraph("The Licensor reserves the right to modify this EULA at any time. Changes will be effective upon posting within the Licensed Application. Your continued use of the Licensed Application after any changes constitutes acceptance of the revised EULA.")

                    section(number: 15, title: "Contact")
                    paragraph("If you have questions about this EULA, please contact us at support@goutcare.app.")
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
            .background(GC.bg.ignoresSafeArea())
            .navigationTitle("End User License Agreement")
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

    private func uppercaseParagraph(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 13))
            .foregroundColor(GC.textSecondary)
            .lineSpacing(4)
            .padding(.bottom, 12)
    }
}
