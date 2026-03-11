import SwiftUI

// MARK: - Medical Citations Full Page
struct MedicalCitationsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Medical Sources")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(GC.text)

                Text(medicalDisclaimerShort)
                    .font(.system(size: 14))
                    .foregroundColor(GC.textSecondary)
                    .lineSpacing(3)

                // Citations list
                VStack(alignment: .leading, spacing: 4) {
                    Text("PEER-REVIEWED REFERENCES")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(GC.accent)
                        .padding(.bottom, 4)

                    ForEach(medicalCitations) { citation in
                        Link(destination: URL(string: citation.url)!) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(citation.title)
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(GC.accent)
                                    .multilineTextAlignment(.leading)
                                    .lineSpacing(2)
                                Text(citation.description)
                                    .font(.system(size: 12))
                                    .foregroundColor(GC.textTertiary)
                                    .multilineTextAlignment(.leading)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(14)
                            .background(GC.bgCard)
                            .cornerRadius(12)
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
                        }
                    }
                }

                // How we use this data
                VStack(alignment: .leading, spacing: 4) {
                    Text("HOW WE USE THIS DATA")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(GC.accent)
                        .padding(.bottom, 4)

                    VStack(alignment: .leading, spacing: 14) {
                        CitationInfoRow(title: "Purine Database", text: "Our 607-item food database uses purine content values from published nutritional research, primarily Kaneko et al. (2014) and supplementary USDA food composition data.")
                        CitationInfoRow(title: "Uric Acid Targets", text: "The target uric acid level of \u{2264}6.0 mg/dL follows the 2020 American College of Rheumatology guidelines for gout management.")
                        CitationInfoRow(title: "Dietary Recommendations", text: "Guidance on high-risk foods and beneficial foods is based on Choi et al. (2004), Zhang et al. (2012), and Dalbeth et al. (2016).")
                        CitationInfoRow(title: "AI-Generated Analysis", text: "Food scan results are AI-estimated approximations. Always verify nutritional information independently and consult your healthcare provider.")
                    }
                    .padding(14)
                    .background(GC.bgCard)
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
                }

                // Disclaimer
                Text("GoutCare is not a medical device and does not provide medical advice, diagnosis, or treatment. The information provided is for informational and educational purposes only. Always consult a qualified healthcare provider before making changes to your diet, medication, or treatment plan.")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(GC.textSecondary)
                    .lineSpacing(3)
                    .padding(14)
                    .background(GC.warning.opacity(0.1))
                    .cornerRadius(12)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.warning.opacity(0.3), lineWidth: 1))
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 32)
        }
        .background(GC.bg.ignoresSafeArea())
        .navigationTitle("Medical Sources")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Citation Info Row
struct CitationInfoRow: View {
    let title: String
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(GC.text)
            Text(text)
                .font(.system(size: 13))
                .foregroundColor(GC.textSecondary)
                .lineSpacing(2)
        }
    }
}

// MARK: - Medical Disclaimer Footer (reusable inline component)
struct MedicalDisclaimerBanner: View {
    @State private var showCitations = false

    var body: some View {
        VStack(spacing: 0) {
            Button {
                showCitations = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "info.circle.fill")
                        .font(.system(size: 14))
                        .foregroundColor(GC.textTertiary)
                    Text(medicalDisclaimerShort)
                        .font(.system(size: 11))
                        .foregroundColor(GC.textTertiary)
                        .multilineTextAlignment(.leading)
                        .lineSpacing(2)
                    Spacer()
                    Text("Sources")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(GC.accent)
                }
                .padding(12)
                .background(GC.bgCard)
                .cornerRadius(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(GC.border, lineWidth: 1))
            }
        }
        .sheet(isPresented: $showCitations) {
            NavigationStack {
                MedicalCitationsView()
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) {
                            Button("Done") { showCitations = false }
                                .foregroundColor(GC.accent)
                        }
                    }
                    .toolbarColorScheme(.dark, for: .navigationBar)
            }
        }
    }
}
