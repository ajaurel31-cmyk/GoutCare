'use client';

import { useRouter } from 'next/navigation';
export default function SupportPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.back()} aria-label="Go back" style={{ padding: 4, display: 'flex' }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Support</h1>
      </div>

      <div style={{ padding: '0 20px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: 24 }}>
          We&apos;re here to help you get the most out of GoutCare. If you have questions, feedback, or run into any issues, you&apos;ll find answers below.
        </p>

        {/* Contact */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          Contact Us
        </h2>
        <p style={{ marginBottom: 16 }}>
          For any questions, bug reports, or feature requests, please email us at{' '}
          <a href="mailto:support@goutcare.app" style={{ color: 'var(--accent)', textDecoration: 'none' }}>support@goutcare.app</a>.
          We aim to respond within 24 hours.
        </p>

        {/* FAQ */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          Frequently Asked Questions
        </h2>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          How does the AI food scanner work?
        </h3>
        <p style={{ marginBottom: 16 }}>
          Take a photo of your meal and GoutCare&apos;s AI will identify the foods, estimate purine content, highlight risks, and suggest lower-purine alternatives. The image is sent securely to our AI service for analysis and is not stored permanently.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          Is my health data private?
        </h3>
        <p style={{ marginBottom: 16 }}>
          Yes. All your health data — uric acid readings, flare logs, food logs, medications, and hydration tracking — is stored locally on your device. We never transmit your personal health records to external servers. The only data sent externally is food images when you use the AI scanner.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          How accurate are the purine values?
        </h3>
        <p style={{ marginBottom: 16 }}>
          Purine values in our 607-item database are based on published nutritional research and are approximate. AI-estimated values from scanned food photos are estimates and may vary based on portion size, preparation method, and ingredients. Always consult your healthcare provider for personalized dietary advice.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          What happens to my data if I uninstall the app?
        </h3>
        <p style={{ marginBottom: 16 }}>
          Since all data is stored locally on your device, uninstalling GoutCare will permanently delete all your data. We recommend exporting a PDF health report from Settings before uninstalling if you want to keep a record.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          How do I cancel my subscription?
        </h3>
        <p style={{ marginBottom: 16 }}>
          You can manage or cancel your subscription at any time through your device&apos;s Settings &gt; Apple ID &gt; Subscriptions. Cancellation takes effect at the end of the current billing period.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          How do I restore my subscription on a new device?
        </h3>
        <p style={{ marginBottom: 16 }}>
          Open GoutCare on your new device and go to Settings. Tap &ldquo;Restore Purchases&rdquo; to reactivate your subscription. Make sure you&apos;re signed in with the same Apple ID used for the original purchase.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          Can I share my health data with my doctor?
        </h3>
        <p style={{ marginBottom: 16 }}>
          Yes. From the Home screen, tap &ldquo;Export Health Report&rdquo; to generate a professional PDF that includes your uric acid history, flare records, medications, and recent food logs. You can share this report via email, print, or any other sharing method.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          How many free food scans do I get?
        </h3>
        <p style={{ marginBottom: 16 }}>
          During the free trial, you can perform up to 3 AI food scans per day. With an active subscription (Monthly or Annual), food scans are unlimited.
        </p>

        {/* Troubleshooting */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          Troubleshooting
        </h2>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          Notifications are not working
        </h3>
        <p style={{ marginBottom: 16 }}>
          Make sure notifications are enabled for GoutCare in your device&apos;s Settings &gt; Notifications &gt; GoutCare. Also verify that your reminders are toggled on within the app&apos;s Settings screen.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          Food scanner is not recognizing my food
        </h3>
        <p style={{ marginBottom: 16 }}>
          For best results, take a well-lit, clear photo with all food items visible. Avoid blurry or dark images. If the scanner doesn&apos;t recognize a food, you can always log it manually using the 607-item food database.
        </p>

        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 16 }}>
          App is not loading or crashing
        </h3>
        <p style={{ marginBottom: 16 }}>
          Try closing and reopening the app. If the issue persists, make sure you are running the latest version of GoutCare from the App Store. If the problem continues, please contact us at{' '}
          <a href="mailto:support@goutcare.app" style={{ color: 'var(--accent)', textDecoration: 'none' }}>support@goutcare.app</a>{' '}
          with a description of the issue and your device model.
        </p>

        {/* Links */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          Legal
        </h2>
        <p style={{ marginBottom: 8 }}>
          <a href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy</a>
        </p>
        <p style={{ marginBottom: 16 }}>
          <a href="/terms" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Terms of Service</a>
        </p>

        {/* Medical Disclaimer */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          Medical Disclaimer
        </h2>
        <p style={{ marginBottom: 16 }}>
          GoutCare is not a medical device and does not provide medical advice, diagnosis, or treatment. The information provided is for informational and educational purposes only. Always consult a qualified healthcare provider before making changes to your diet, medication, or treatment plan.
        </p>
      </div>
    </div>
  );
}
