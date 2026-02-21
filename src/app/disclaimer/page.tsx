import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Medical Disclaimer \u2014 GoutCare',
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

const warningBoxStyle: React.CSSProperties = {
  padding: '20px',
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: '12px',
  marginBottom: '24px',
};

const warningTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: 'var(--color-danger)',
  marginBottom: '10px',
};

const warningTextStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: 'var(--color-text)',
  margin: 0,
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

const linkStyle: React.CSSProperties = {
  color: 'var(--color-primary)',
  textDecoration: 'underline',
};

export default function DisclaimerPage() {
  return (
    <div style={pageStyle}>
      <Link href="/settings" style={backLinkStyle}>
        &larr; Back to Settings
      </Link>

      <h1 style={titleStyle}>Medical Disclaimer</h1>
      <p style={dateStyle}>Effective Date: January 1, 2026</p>

      {/* Prominent Warning Box */}
      <div style={warningBoxStyle}>
        <p style={warningTitleStyle}>Important: Not Medical Advice</p>
        <p style={warningTextStyle}>
          GoutCare is a health management tool for informational and educational purposes only. It is
          <strong> NOT a medical device</strong> and does <strong>NOT provide medical advice,
          diagnosis, or treatment</strong>. Always consult your doctor or rheumatologist before making
          changes to your diet, medications, or treatment plan.
        </p>
      </div>

      <h2 style={sectionTitleStyle}>1. General Disclaimer</h2>
      <p style={pStyle}>
        The information provided by the GoutCare application, including but not limited to purine
        content estimates, food recommendations, uric acid trend analysis, flare tracking insights,
        and AI-powered food scanning results, is intended for general informational and educational
        purposes only.
      </p>
      <p style={pStyle}>
        This information is not intended to be, and should not be construed as, medical advice or a
        substitute for professional medical consultation, diagnosis, or treatment. Never disregard
        professional medical advice or delay in seeking it because of information you received from
        this application.
      </p>

      <h2 style={sectionTitleStyle}>2. AI Food Scanner Accuracy</h2>
      <p style={pStyle}>
        The AI Food Scanner feature uses artificial intelligence to estimate the purine content of
        foods from photographs. Please be aware that:
      </p>
      <ul style={listStyle}>
        <li style={liStyle}>
          AI estimates may be inaccurate and should be treated as approximations only
        </li>
        <li style={liStyle}>
          The AI may misidentify foods or provide incorrect purine values
        </li>
        <li style={liStyle}>
          Actual purine content varies based on preparation method, portion size, brand, and
          individual food variations
        </li>
        <li style={liStyle}>
          These estimates should not be the sole basis for dietary decisions
        </li>
      </ul>

      <h2 style={sectionTitleStyle}>3. Purine Database</h2>
      <p style={pStyle}>
        The purine database included in GoutCare is compiled from publicly available sources and
        published research. While we strive for accuracy, purine values may vary between sources and
        should be considered approximate. The database does not account for individual variations in
        food preparation or sourcing.
      </p>

      <h2 style={sectionTitleStyle}>4. Medication Tracking</h2>
      <p style={pStyle}>
        The medication tracking feature is a personal reminder tool only. It does not:
      </p>
      <ul style={listStyle}>
        <li style={liStyle}>Replace professional pharmaceutical guidance</li>
        <li style={liStyle}>Account for all possible drug interactions</li>
        <li style={liStyle}>Provide dosage recommendations</li>
        <li style={liStyle}>Serve as a substitute for consulting with your pharmacist or doctor</li>
      </ul>
      <p style={pStyle}>
        Drug interaction warnings shown in the app are general guidelines and may not be
        comprehensive. Always consult your healthcare provider or pharmacist about potential
        medication interactions.
      </p>

      <h2 style={sectionTitleStyle}>5. Health Monitoring</h2>
      <p style={pStyle}>
        Uric acid tracking, flare logging, and other health monitoring features are personal record-
        keeping tools. They do not replace laboratory testing or clinical assessment. If you
        experience a gout flare, severe pain, or any health emergency, seek immediate medical
        attention.
      </p>

      <h2 style={sectionTitleStyle}>6. When to Seek Medical Help</h2>
      <p style={pStyle}>Contact your healthcare provider immediately if you experience:</p>
      <ul style={listStyle}>
        <li style={liStyle}>Severe joint pain, swelling, or redness</li>
        <li style={liStyle}>Fever accompanying joint symptoms</li>
        <li style={liStyle}>Inability to move a joint</li>
        <li style={liStyle}>Symptoms that worsen despite treatment</li>
        <li style={liStyle}>Signs of kidney problems (changes in urination, swelling, fatigue)</li>
        <li style={liStyle}>Adverse reactions to any medication</li>
      </ul>

      <h2 style={sectionTitleStyle}>7. Limitation of Liability</h2>
      <p style={pStyle}>
        To the fullest extent permitted by law, GoutCare and its developers shall not be held liable
        for any health outcomes, injury, or damages resulting from reliance on information provided by
        this application. Use of the App is entirely at your own risk.
      </p>

      <h2 style={sectionTitleStyle}>8. Acknowledgment</h2>
      <p style={pStyle}>
        By using GoutCare, you acknowledge that you have read and understood this Medical Disclaimer
        and agree that the App is not a substitute for professional medical care. You accept full
        responsibility for your health decisions and agree to consult qualified healthcare
        professionals for medical advice.
      </p>

      <p style={pStyle}>
        For additional information, please review our{' '}
        <Link href="/terms" style={linkStyle}>
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" style={linkStyle}>
          Privacy Policy
        </Link>
        .
      </p>

      <h2 style={sectionTitleStyle}>9. Contact</h2>
      <p style={pStyle}>
        If you have questions about this disclaimer, contact us at:
      </p>
      <p style={pStyle}>
        <strong>Email:</strong> support@goutcare.app
        <br />
        <strong>Website:</strong> https://goutcare.app
      </p>
    </div>
  );
}
