'use client';

import { useRouter } from 'next/navigation';
export default function EulaPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.back()} aria-label="Go back" style={{ padding: 4, display: 'flex' }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>End User License Agreement</h1>
      </div>

      <div style={{ padding: '0 20px', fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: 16, color: 'var(--text)', fontWeight: 600, fontSize: 13 }}>
          Last updated: March 2026
        </p>

        <p style={{ marginBottom: 16 }}>
          This End User License Agreement (&ldquo;EULA&rdquo;) is a legal agreement between you (&ldquo;User&rdquo;) and GoutCare (&ldquo;Licensor&rdquo;) for the use of the GoutCare mobile application (&ldquo;Licensed Application&rdquo;). By downloading, installing, or using the Licensed Application, you agree to be bound by this EULA. If you do not agree, do not use the Licensed Application.
        </p>

        <h2 style={h2}>1. License Grant</h2>
        <p style={{ marginBottom: 16 }}>
          The Licensor grants you a limited, non-exclusive, non-transferable, revocable license to download, install, and use the Licensed Application on Apple-branded devices that you own or control, as permitted by the Apple App Store Terms of Service. This license does not allow you to use the Licensed Application on any device that you do not own or control, and you may not distribute or make the Licensed Application available over a network where it could be used by multiple devices at the same time.
        </p>

        <h2 style={h2}>2. Scope of License</h2>
        <p style={{ marginBottom: 16 }}>
          You may not copy, reverse-engineer, disassemble, attempt to derive the source code of, modify, or create derivative works of the Licensed Application, any updates, or any part thereof. Any attempt to do so is a violation of the rights of the Licensor. If you breach this restriction, you may be subject to prosecution and damages.
        </p>

        <h2 style={h2}>3. Subscriptions and In-App Purchases</h2>
        <p style={{ marginBottom: 16 }}>
          The Licensed Application offers auto-renewable subscription plans. Payment is charged to your Apple ID account at confirmation of purchase. Subscriptions automatically renew unless auto-renewal is turned off at least 24 hours before the end of the current billing period. Your account will be charged for renewal within 24 hours prior to the end of the current period at the rate of your selected plan. You can manage and cancel subscriptions in your Apple ID account settings. Any unused portion of a free trial period will be forfeited when you purchase a subscription.
        </p>

        <h2 style={h2}>4. Medical Disclaimer</h2>
        <p style={{ marginBottom: 16 }}>
          The Licensed Application is not a medical device and is not intended to diagnose, treat, cure, or prevent any disease or health condition. The information provided, including AI-generated purine estimates, is for informational and educational purposes only. Always consult a qualified healthcare provider before making changes to your diet, medication, or treatment plan. The Licensor assumes no responsibility for any health outcomes resulting from use of the Licensed Application.
        </p>

        <h2 style={h2}>5. AI-Generated Content Disclaimer</h2>
        <p style={{ marginBottom: 16 }}>
          The food scanning feature uses artificial intelligence to estimate purine content from images. These estimates are approximations and may be inaccurate. The Licensor makes no warranty regarding the accuracy, reliability, or completeness of AI-generated content. Users should verify nutritional information independently and not rely solely on the Licensed Application for dietary decisions.
        </p>

        <h2 style={h2}>6. Data and Privacy</h2>
        <p style={{ marginBottom: 16 }}>
          Health data entered into the Licensed Application is stored locally on your device. Food images submitted for AI analysis are processed in real-time and are not permanently stored on external servers. For full details, see our Privacy Policy. You are responsible for maintaining the security of your device and your data.
        </p>

        <h2 style={h2}>7. Intellectual Property</h2>
        <p style={{ marginBottom: 16 }}>
          The Licensed Application, including all content, features, design, graphics, and functionality, is the property of the Licensor and is protected by copyright, trademark, and other intellectual property laws. This EULA does not grant you any rights to trademarks or service marks of the Licensor.
        </p>

        <h2 style={h2}>8. Warranty Disclaimer</h2>
        <p style={{ marginBottom: 16 }}>
          THE LICENSED APPLICATION IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. THE LICENSOR DOES NOT WARRANT THAT THE LICENSED APPLICATION WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
        </p>

        <h2 style={h2}>9. Limitation of Liability</h2>
        <p style={{ marginBottom: 16 }}>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR USE OF OR INABILITY TO USE THE LICENSED APPLICATION; (B) ANY CONTENT OBTAINED FROM THE LICENSED APPLICATION; OR (C) UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA.
        </p>

        <h2 style={h2}>10. Third-Party Services</h2>
        <p style={{ marginBottom: 16 }}>
          The Licensed Application may use third-party services, including Anthropic&apos;s AI API for food image analysis. Your use of such third-party services is subject to their respective terms and policies. The Licensor is not responsible for the practices of any third-party services.
        </p>

        <h2 style={h2}>11. Termination</h2>
        <p style={{ marginBottom: 16 }}>
          This EULA is effective until terminated. Your rights under this EULA will terminate automatically without notice if you fail to comply with any of its terms. Upon termination, you must cease all use of the Licensed Application and delete all copies from your devices.
        </p>

        <h2 style={h2}>12. Apple-Specific Terms</h2>
        <p style={{ marginBottom: 16 }}>
          This EULA is between you and the Licensor only, and not with Apple Inc. (&ldquo;Apple&rdquo;). The Licensor, not Apple, is solely responsible for the Licensed Application and its content. Apple has no obligation to provide maintenance or support services for the Licensed Application. In the event of any failure of the Licensed Application to conform to any applicable warranty, you may notify Apple and Apple will refund the purchase price (if any) for the Licensed Application. To the maximum extent permitted by applicable law, Apple has no other warranty obligation with respect to the Licensed Application. Apple is not responsible for addressing any claims relating to the Licensed Application or your possession and use of the Licensed Application. Apple is a third-party beneficiary of this EULA and, upon your acceptance, Apple will have the right to enforce this EULA against you as a third-party beneficiary.
        </p>

        <h2 style={h2}>13. Governing Law</h2>
        <p style={{ marginBottom: 16 }}>
          This EULA shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
        </p>

        <h2 style={h2}>14. Changes to This EULA</h2>
        <p style={{ marginBottom: 16 }}>
          The Licensor reserves the right to modify this EULA at any time. Changes will be effective upon posting within the Licensed Application. Your continued use of the Licensed Application after any changes constitutes acceptance of the revised EULA.
        </p>

        <h2 style={h2}>15. Contact</h2>
        <p style={{ marginBottom: 16 }}>
          If you have questions about this EULA, please contact us at support@goutcare.app.
        </p>
      </div>
    </div>
  );
}

const h2: React.CSSProperties = {
  fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, marginTop: 24,
};
