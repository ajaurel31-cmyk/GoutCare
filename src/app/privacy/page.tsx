'use client';

import { useRouter } from 'next/navigation';
export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.back()} aria-label="Go back" style={{ padding: 4, display: 'flex' }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Privacy Policy</h1>
      </div>

      <div style={{ padding: '0 20px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: 16, color: 'var(--text)', fontWeight: 600, fontSize: 13 }}>
          Last updated: February 2026
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          1. Introduction
        </h2>
        <p style={{ marginBottom: 16 }}>
          GoutCare (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the App&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          2. Information We Collect
        </h2>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 12 }}>
          2.1 Health Data You Provide
        </h3>
        <p style={{ marginBottom: 12 }}>
          The App allows you to enter health-related information including uric acid readings, gout flare details, food consumption logs, water intake, and medication schedules. This data is stored locally on your device and is not transmitted to our servers.
        </p>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 12 }}>
          2.2 Food Images
        </h3>
        <p style={{ marginBottom: 12 }}>
          When you use the AI food scanning feature, images of food are sent to our AI analysis service (powered by Anthropic&apos;s Claude) for purine content estimation. These images are processed in real-time and are not stored permanently on our servers.
        </p>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, marginTop: 12 }}>
          2.3 Device Information
        </h3>
        <p style={{ marginBottom: 16 }}>
          We may collect basic device information (device type, operating system version) for app compatibility and performance purposes.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          3. How We Use Your Information
        </h2>
        <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
          <li style={{ marginBottom: 6 }}>To provide and maintain the App&apos;s functionality</li>
          <li style={{ marginBottom: 6 }}>To analyze food images for purine content estimation</li>
          <li style={{ marginBottom: 6 }}>To send local notifications for medication and hydration reminders (with your permission)</li>
          <li style={{ marginBottom: 6 }}>To improve the App&apos;s features and user experience</li>
        </ul>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          4. Data Storage
        </h2>
        <p style={{ marginBottom: 16 }}>
          All personal health data (uric acid readings, flare logs, food logs, medication schedules, hydration tracking) is stored exclusively on your device using local storage. We do not have access to this data. If you clear your app data or uninstall the App, this data will be permanently deleted.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          5. Data Sharing
        </h2>
        <p style={{ marginBottom: 16 }}>
          We do not sell, trade, or otherwise transfer your personal information to third parties. Food images sent for AI analysis are processed by Anthropic&apos;s API service and are subject to Anthropic&apos;s privacy policy. No other personal data is shared with third parties.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          6. Camera and Photo Access
        </h2>
        <p style={{ marginBottom: 16 }}>
          The App requests access to your device camera and photo library solely for the purpose of capturing or selecting food images for AI purine analysis. Camera access is optional and only used when you initiate a food scan.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          7. Notifications
        </h2>
        <p style={{ marginBottom: 16 }}>
          The App may request permission to send local notifications for medication reminders, hydration reminders, and other health tracking reminders. You can manage notification permissions in your device settings at any time.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          8. Children&apos;s Privacy
        </h2>
        <p style={{ marginBottom: 16 }}>
          GoutCare is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete it.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          9. Your Rights
        </h2>
        <p style={{ marginBottom: 16 }}>
          Since your health data is stored locally on your device, you have full control over it. You can delete all your data at any time through the Settings page in the App. You can also delete all app data by uninstalling the App from your device.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          10. Security
        </h2>
        <p style={{ marginBottom: 16 }}>
          We take reasonable measures to protect the information processed through our services. However, no electronic transmission or storage method is 100% secure. Your locally stored data is protected by your device&apos;s built-in security features.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          11. Changes to This Policy
        </h2>
        <p style={{ marginBottom: 16 }}>
          We may update this Privacy Policy from time to time. Changes will be posted within the App and the &ldquo;Last updated&rdquo; date will be revised. Your continued use of the App after changes are posted constitutes acceptance of the updated policy.
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24 }}>
          12. Contact Us
        </h2>
        <p style={{ marginBottom: 16 }}>
          If you have questions or concerns about this Privacy Policy, please contact us at support@goutcare.app.
        </p>
      </div>
    </div>
  );
}
