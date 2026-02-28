'use client';

import { useRouter } from 'next/navigation';
export default function TermsPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.back()} aria-label="Go back" style={{ padding: 4, display: 'flex' }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Terms of Service</h1>
      </div>

      <div style={{ padding: '0 20px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: 16, color: 'var(--text)', fontWeight: 600, fontSize: 13 }}>
          Last updated: February 2026
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          1. Acceptance of Terms
        </h2>
        <p style={{ marginBottom: 16 }}>
          By downloading, installing, or using GoutCare (&ldquo;the App&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the App.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          2. Description of Service
        </h2>
        <p style={{ marginBottom: 16 }}>
          GoutCare is a health-tracking application that helps users monitor purine intake, log uric acid levels, track gout flares, and manage hydration. The App uses artificial intelligence to analyze food images for estimated purine content.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          3. Medical Disclaimer
        </h2>
        <p style={{ marginBottom: 16 }}>
          GoutCare is not a medical device and does not provide medical advice, diagnosis, or treatment. The information provided by the App is for informational and educational purposes only. Always consult a qualified healthcare provider before making any changes to your diet, medication, or treatment plan. Do not disregard professional medical advice or delay seeking treatment because of information provided by this App.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          4. AI-Generated Content
        </h2>
        <p style={{ marginBottom: 16 }}>
          The food scanning feature uses AI to estimate purine content. These estimates may not be accurate and should not be relied upon as the sole basis for dietary decisions. Purine values in the database are approximate and may vary based on preparation method, portion size, and other factors.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          5. Subscriptions and Payments
        </h2>
        <p style={{ marginBottom: 16 }}>
          GoutCare offers a 7-day free trial and paid subscription plans. Subscriptions are billed through Apple&apos;s App Store. Payment will be charged to your Apple ID account at confirmation of purchase. Subscriptions automatically renew unless auto-renewal is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscriptions by going to your account settings on the App Store after purchase.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          6. Free Trial
        </h2>
        <p style={{ marginBottom: 16 }}>
          New users may be eligible for a 7-day free trial. At the end of the trial period, you must subscribe to continue using premium features. If you do not subscribe, your access to premium features will be restricted.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          7. User Data
        </h2>
        <p style={{ marginBottom: 16 }}>
          Health data you enter into the App (uric acid readings, flare logs, food logs, hydration tracking) is stored locally on your device. We do not transmit your personal health data to external servers except when using the AI food scanning feature, which sends food images to our AI service for analysis. See our Privacy Policy for more details.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          8. Intellectual Property
        </h2>
        <p style={{ marginBottom: 16 }}>
          All content, features, and functionality of the App are owned by GoutCare and are protected by copyright, trademark, and other intellectual property laws.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          9. Limitation of Liability
        </h2>
        <p style={{ marginBottom: 16 }}>
          To the fullest extent permitted by law, GoutCare shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the App. GoutCare is not responsible for any health outcomes resulting from use of the App.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          10. Changes to Terms
        </h2>
        <p style={{ marginBottom: 16 }}>
          We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting within the App. Your continued use of the App constitutes acceptance of the modified Terms.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          11. Termination
        </h2>
        <p style={{ marginBottom: 16 }}>
          We may terminate or suspend your access to the App at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          12. Contact
        </h2>
        <p style={{ marginBottom: 16 }}>
          If you have questions about these Terms, please contact us at support@goutcare.app.
        </p>
      </div>
    </div>
  );
}
