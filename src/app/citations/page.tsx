'use client';

import { MEDICAL_CITATIONS, MEDICAL_DISCLAIMER_SHORT } from '@/lib/constants';

export default function CitationsPage() {
  return (
    <div style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
        Medical Sources
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
        {MEDICAL_DISCLAIMER_SHORT}
      </p>

      <div className="section">
        <div className="section-label">Peer-Reviewed References</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MEDICAL_CITATIONS.map((citation) => (
            <a
              key={citation.id}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              style={{
                display: 'block',
                padding: '14px 16px',
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', lineHeight: 1.5, marginBottom: 6 }}>
                {citation.title}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                {citation.description}
              </div>
              <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 6, opacity: 0.7 }}>
                {citation.url}
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section-label">How We Use This Data</div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Purine Database</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Our 607-item food database uses purine content values from published nutritional research,
                primarily Kaneko et al. (2014) and supplementary USDA food composition data.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Uric Acid Targets</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The target uric acid level of &le;6.0 mg/dL follows the 2020 American College of Rheumatology
                guidelines for gout management. Elevated (&gt;6.0) and High (&gt;7.0) thresholds are based
                on clinical literature (Neogi, 2011).
              </p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Dietary Recommendations</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Guidance on high-risk foods (organ meats, shellfish, alcohol) and beneficial foods (cherries,
                low-fat dairy, coffee) is based on Choi et al. (2004), Zhang et al. (2012), Choi &amp; Curhan (2007),
                and Dalbeth et al. (2016).
              </p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>AI-Generated Analysis</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Food scan results are AI-estimated approximations and may not be fully accurate.
                Always verify nutritional information independently and consult your healthcare provider
                for personalized dietary advice.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 16, marginBottom: 24, padding: '14px 16px',
        background: 'var(--warning-light)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--warning)',
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
          GoutCare is not a medical device and does not provide medical advice, diagnosis, or treatment.
          The information provided is for informational and educational purposes only. Always consult a
          qualified healthcare provider before making changes to your diet, medication, or treatment plan.
        </p>
      </div>
    </div>
  );
}
