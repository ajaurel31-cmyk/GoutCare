import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy \u2014 GoutCare',
};

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '16px',
  paddingBottom: '60px',
  maxWidth: '640px',
  margin: '0 auto',
};

const backLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '14px',
  color: 'var(--color-primary)',
  textDecoration: 'none',
  marginBottom: '16px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '700',
  marginBottom: '6px',
};

const dateStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  marginBottom: '28px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  marginTop: '28px',
  marginBottom: '10px',
};

const pStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: 'var(--color-text-secondary)',
  marginBottom: '12px',
};

const listStyle: React.CSSProperties = {
  paddingLeft: '24px',
  marginBottom: '12px',
};

const liStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: 'var(--color-text-secondary)',
  marginBottom: '6px',
};

export default function PrivacyPage() {
  return (
    <div style={pageStyle}>
      <Link href="/settings" style={backLinkStyle}>
        &larr; Back to Settings
      </Link>

      <h1 style={titleStyle}>Privacy Policy</h1>
      <p style={dateStyle}>Effective Date: January 1, 2026</p>

      <h2 style={sectionTitleStyle}>1. Introduction</h2>
      <p style={pStyle}>
        GoutCare (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your
        privacy. This Privacy Policy explains how the GoutCare application (&quot;App&quot;) handles
        your information. We designed GoutCare with a privacy-first approach — your health data stays
        on your device.
      </p>

      <h2 style={sectionTitleStyle}>2. Data Storage &amp; Privacy-First Design</h2>
      <p style={pStyle}>
        GoutCare stores all your personal health data exclusively on your device using local storage.
        This includes:
      </p>
      <ul style={listStyle}>
        <li style={liStyle}>Daily purine intake logs and food entries</li>
        <li style={liStyle}>Uric acid readings and trends</li>
        <li style={liStyle}>Gout flare records (dates, joints, pain levels, triggers, treatments)</li>
        <li style={liStyle}>Medication schedules and dose logs</li>
        <li style={liStyle}>Water intake records</li>
        <li style={liStyle}>Your profile settings and preferences</li>
      </ul>
      <p style={pStyle}>
        <strong>We do not collect, transmit, or store your health data on any external server.</strong>{' '}
        Your data never leaves your device except when you explicitly choose to export it.
      </p>

      <h2 style={sectionTitleStyle}>3. AI Food Scanner</h2>
      <p style={pStyle}>
        When you use the AI Food Scanner feature, photos you capture are sent to our server solely
        for the purpose of analyzing the food&apos;s purine content using AI technology. These images are:
      </p>
      <ul style={listStyle}>
        <li style={liStyle}>Processed in real-time and not stored on our servers</li>
        <li style={liStyle}>Not used for training AI models</li>
        <li style={liStyle}>Not shared with any third parties</li>
        <li style={liStyle}>Deleted immediately after analysis is complete</li>
      </ul>

      <h2 style={sectionTitleStyle}>4. Information We Collect</h2>
      <p style={pStyle}>
        We collect minimal information necessary for the App to function:
      </p>
      <ul style={listStyle}>
        <li style={liStyle}>
          <strong>Subscription Data:</strong> If you subscribe to GoutCare Premium, Apple handles all
          payment processing. We receive only your subscription status (active/inactive), not payment
          details.
        </li>
        <li style={liStyle}>
          <strong>Device Information:</strong> Basic device type and operating system version for
          compatibility purposes.
        </li>
        <li style={liStyle}>
          <strong>Crash Reports:</strong> Anonymous crash data to help us improve app stability. No
          personal health data is included.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>5. Data You Control</h2>
      <p style={pStyle}>
        You have full control over your data at all times:
      </p>
      <ul style={listStyle}>
        <li style={liStyle}>
          <strong>Export:</strong> Export all your data as a JSON file through Settings &gt; Export Data
        </li>
        <li style={liStyle}>
          <strong>Delete:</strong> Clear all data through Settings &gt; Clear All Data. This action is
          irreversible.
        </li>
        <li style={liStyle}>
          <strong>No Account Required:</strong> GoutCare does not require you to create an account or
          provide any personally identifiable information.
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>6. Third-Party Services</h2>
      <p style={pStyle}>
        GoutCare uses the following third-party services:
      </p>
      <ul style={listStyle}>
        <li style={liStyle}>
          <strong>Apple App Store:</strong> For subscription management and payment processing
        </li>
        <li style={liStyle}>
          <strong>Anthropic Claude API:</strong> For AI-powered food analysis (images are processed in
          real-time and not stored)
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>7. Children&apos;s Privacy</h2>
      <p style={pStyle}>
        GoutCare is not intended for use by children under 13. We do not knowingly collect personal
        information from children. If you believe a child has provided us with personal information,
        please contact us so we can take appropriate action.
      </p>

      <h2 style={sectionTitleStyle}>8. Changes to This Policy</h2>
      <p style={pStyle}>
        We may update this Privacy Policy from time to time. If we make material changes, we will
        notify you through the App. Your continued use of the App after changes become effective
        constitutes acceptance of the revised policy.
      </p>

      <h2 style={sectionTitleStyle}>9. Contact Us</h2>
      <p style={pStyle}>
        If you have questions about this Privacy Policy or our data practices, please contact us at:
      </p>
      <p style={pStyle}>
        <strong>Email:</strong> privacy@goutcare.app
        <br />
        <strong>Website:</strong> https://goutcare.app
      </p>
    </div>
  );
}
