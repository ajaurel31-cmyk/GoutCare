import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service \u2014 GoutCare',
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
  color: '#1a56db',
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
  color: '#6b7280',
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
  color: '#374151',
  marginBottom: '12px',
};

const listStyle: React.CSSProperties = {
  paddingLeft: '24px',
  marginBottom: '12px',
};

const liStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#374151',
  marginBottom: '6px',
};

const linkStyle: React.CSSProperties = {
  color: '#1a56db',
  textDecoration: 'underline',
};

export default function TermsPage() {
  return (
    <div style={pageStyle}>
      <Link href="/settings" style={backLinkStyle}>
        &larr; Back to Settings
      </Link>

      <h1 style={titleStyle}>Terms of Service</h1>
      <p style={dateStyle}>Effective Date: January 1, 2026</p>

      {/* 1. Acceptance of Terms */}
      <h2 style={sectionTitleStyle}>1. Acceptance of Terms</h2>
      <p style={pStyle}>
        By downloading, installing, or using the GoutCare application (&quot;App&quot;), you agree
        to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these
        Terms, please do not use the App. These Terms constitute a legally binding agreement
        between you and GoutCare (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
      </p>

      {/* 2. Description of Service */}
      <h2 style={sectionTitleStyle}>2. Description of Service</h2>
      <p style={pStyle}>
        GoutCare is a mobile health management application designed to help individuals manage
        gout through food scanning, purine tracking, uric acid monitoring, flare logging, and
        personalized dietary guidance. The App provides tools for:
      </p>
      <ul style={listStyle}>
        <li style={liStyle}>AI-powered food scanning and purine estimation</li>
        <li style={liStyle}>Daily purine intake tracking</li>
        <li style={liStyle}>Uric acid level monitoring</li>
        <li style={liStyle}>Gout flare logging and analysis</li>
        <li style={liStyle}>Medication tracking and reminders</li>
        <li style={liStyle}>Hydration tracking</li>
        <li style={liStyle}>Gout-friendly meal recommendations</li>
        <li style={liStyle}>A searchable purine food database</li>
      </ul>

      {/* 3. Subscription Terms */}
      <h2 style={sectionTitleStyle}>3. Subscription Terms</h2>
      <p style={pStyle}>
        GoutCare offers both free and premium subscription plans:
      </p>
      <ul style={listStyle}>
        <li style={liStyle}>
          <strong>Free Plan:</strong> Includes basic tracking features with a limited number of
          daily AI food scans (currently 3 per day).
        </li>
        <li style={liStyle}>
          <strong>Free Trial:</strong> New users may receive a 7-day free trial of all premium
          features. The trial begins upon account creation and does not require payment
          information.
        </li>
        <li style={liStyle}>
          <strong>Monthly Premium:</strong> $4.99/month, billed monthly through the Apple App
          Store.
        </li>
        <li style={liStyle}>
          <strong>Annual Premium:</strong> $29.99/year, billed annually through the Apple App
          Store.
        </li>
      </ul>
      <p style={pStyle}>
        Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current
        billing period. You can manage or cancel your subscription through your Apple ID settings
        in the App Store. Refunds are handled in accordance with Apple&apos;s refund policies.
      </p>

      {/* 4. Medical Disclaimer */}
      <h2 style={sectionTitleStyle}>4. Medical Disclaimer</h2>
      <p style={pStyle}>
        <strong>GoutCare is NOT a medical device and does NOT provide medical advice.</strong> The
        information provided by the App, including purine estimates, meal suggestions, and AI food
        analysis, is for informational and educational purposes only. It is not intended to be a
        substitute for professional medical advice, diagnosis, or treatment.
      </p>
      <p style={pStyle}>
        Always seek the advice of your rheumatologist or other qualified healthcare provider with
        any questions you may have regarding gout or any other medical condition. Never disregard
        professional medical advice or delay seeking it because of information provided by this
        App.
      </p>

      {/* 5. User Responsibilities */}
      <h2 style={sectionTitleStyle}>5. User Responsibilities</h2>
      <p style={pStyle}>As a user of GoutCare, you agree to:</p>
      <ul style={listStyle}>
        <li style={liStyle}>
          Provide accurate health data when using the App&apos;s tracking features
        </li>
        <li style={liStyle}>
          Not rely solely on the App for medical decisions
        </li>
        <li style={liStyle}>
          Consult with healthcare professionals before changing medications or treatment plans
        </li>
        <li style={liStyle}>
          Use the App in compliance with all applicable laws and regulations
        </li>
        <li style={liStyle}>
          Not attempt to reverse-engineer, modify, or distribute the App or its content
        </li>
        <li style={liStyle}>
          Not use the App for any unlawful or unauthorized purpose
        </li>
      </ul>

      {/* 6. Privacy */}
      <h2 style={sectionTitleStyle}>6. Privacy</h2>
      <p style={pStyle}>
        Your privacy is important to us. Please review our{' '}
        <Link href="/privacy" style={linkStyle}>
          Privacy Policy
        </Link>{' '}
        to understand how we collect, use, and protect your information. By using the App, you
        consent to our data practices as described in the Privacy Policy.
      </p>

      {/* 7. Intellectual Property */}
      <h2 style={sectionTitleStyle}>7. Intellectual Property</h2>
      <p style={pStyle}>
        All content, features, functionality, design, graphics, trademarks, and other intellectual
        property within the GoutCare App are owned by or licensed to us and are protected by
        copyright, trademark, and other intellectual property laws. You may not reproduce,
        distribute, modify, create derivative works of, publicly display, or otherwise exploit any
        of our content without prior written permission.
      </p>

      {/* 8. Limitation of Liability */}
      <h2 style={sectionTitleStyle}>8. Limitation of Liability</h2>
      <p style={pStyle}>
        To the fullest extent permitted by applicable law, GoutCare and its developers, officers,
        employees, and agents shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages, including but not limited to loss of data, health
        complications, or financial losses, arising out of or related to your use of the App.
      </p>
      <p style={pStyle}>
        The App is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
        warranties of any kind, either express or implied. We do not warrant that the App will be
        uninterrupted, error-free, or free of viruses or other harmful components.
      </p>

      {/* 9. Changes to Terms */}
      <h2 style={sectionTitleStyle}>9. Changes to Terms</h2>
      <p style={pStyle}>
        We reserve the right to modify these Terms at any time. If we make material changes, we
        will notify you through the App or via other reasonable means. Your continued use of the
        App after changes become effective constitutes acceptance of the revised Terms. We
        encourage you to review these Terms periodically.
      </p>

      {/* 10. Contact Information */}
      <h2 style={sectionTitleStyle}>10. Contact Information</h2>
      <p style={pStyle}>
        If you have any questions or concerns about these Terms of Service, please contact us at:
      </p>
      <p style={pStyle}>
        <strong>Email:</strong> support@goutcare.app
        <br />
        <strong>Website:</strong> https://goutcare.app
      </p>
    </div>
  );
}
