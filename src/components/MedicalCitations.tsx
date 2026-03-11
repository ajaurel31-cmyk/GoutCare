'use client';

import { useState } from 'react';
import { MEDICAL_CITATIONS, MEDICAL_DISCLAIMER_SHORT } from '@/lib/constants';

export function MedicalCitationsBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      marginTop: 24,
      padding: '14px 16px',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          cursor: 'pointer',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="var(--accent)" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
            Medical Sources & Citations
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: 12 }}>
            {MEDICAL_DISCLAIMER_SHORT}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MEDICAL_CITATIONS.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: 'var(--accent)',
                  lineHeight: 1.5,
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                <span style={{ fontWeight: 600 }}>{c.title}</span>
                <br />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.description}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MedicalDisclaimerFooter() {
  return (
    <div style={{
      marginTop: 20,
      marginBottom: 16,
      padding: '12px 16px',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="var(--text-tertiary)" />
        </svg>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          {MEDICAL_DISCLAIMER_SHORT}{' '}
          <a href="/citations" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            View sources
          </a>
        </p>
      </div>
    </div>
  );
}
