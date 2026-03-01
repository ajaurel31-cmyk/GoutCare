'use client';

import { useState, useRef, useCallback } from 'react';
import {
  ScanIcon,
  CameraIcon,
  CloseIcon,
  CheckIcon,
  AlertIcon,
  ForkKnifeIcon,
} from '@/components/icons';
import { addFoodEntry, getScanCount, incrementScanCount } from '@/lib/storage';
import { isSubscribed, isTrialActive } from '@/lib/subscription';
import { FREE_SCAN_LIMIT } from '@/lib/constants';
import { getToday } from '@/lib/utils';
import type { ScanResult } from '@/lib/types';

type ScanState = 'idle' | 'preview' | 'analyzing' | 'results' | 'error';

function purineBadgeColor(level: string): string {
  if (level === 'low') return 'var(--purine-low)';
  if (level === 'moderate') return 'var(--purine-moderate)';
  if (level === 'high') return 'var(--purine-high)';
  return 'var(--purine-very-high)';
}

function purineBgColor(level: string): string {
  if (level === 'low') return 'var(--success-light)';
  if (level === 'moderate') return 'var(--warning-light)';
  if (level === 'high') return 'var(--orange-light)';
  return 'var(--danger-light)';
}

export default function ScannerPage() {
  const [state, setState] = useState<ScanState>('idle');
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const canScan = useCallback(() => {
    if (isSubscribed() || isTrialActive()) return true;
    return getScanCount() < FREE_SCAN_LIMIT;
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      setState('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
      setState('preview');
      setResult(null);
      setSaved(false);
      setError(null);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleAnalyze = async () => {
    if (!imageData) return;

    if (!canScan()) {
      setError(`You've used all ${FREE_SCAN_LIMIT} free scans today. Subscribe for unlimited scans.`);
      setState('error');
      return;
    }

    setState('analyzing');
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/analyze`
        : '/api/analyze';
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [imageData] }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Analysis server not reachable. Please check your connection and try again.');
        }
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Analysis failed (${res.status})`);
      }

      const data: ScanResult = await res.json();
      setResult(data);
      incrementScanCount();
      setState('results');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setState('error');
    }
  };

  const handleSaveToLog = () => {
    if (!result) return;
    const today = getToday();
    addFoodEntry(today, {
      foodId: `scan-${Date.now()}`,
      name: result.foods.join(', '),
      servingSize: '1 serving',
      purineContent: result.estimatedPurine,
    });
    setSaved(true);
    showToast('Added to today\'s food log');
  };

  const handleReset = () => {
    setState('idle');
    setImageData(null);
    setResult(null);
    setError(null);
    setSaved(false);
  };

  const scansRemaining = !isSubscribed() && !isTrialActive()
    ? Math.max(0, FREE_SCAN_LIMIT - getScanCount())
    : null;

  return (
    <div style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Food Scanner</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        Snap a photo and AI will analyze purine content
      </p>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* ── IDLE STATE ──────────────────────────────────────────── */}
      {state === 'idle' && (
        <>
          {/* Camera / Upload Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px',
                background: 'var(--accent)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {/* Camera + food crosshair icon */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="1" y="6" width="22" height="15" rx="3" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="1.5"/>
                  <path d="M8 6L9.5 3h5L16 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13.5" r="4.5" stroke="#fff" strokeWidth="1.5"/>
                  <circle cx="12" cy="13.5" r="2" fill="#fff" opacity="0.6"/>
                  <line x1="12" y1="9" x2="12" y2="10.5" stroke="#fff" strokeWidth="1" opacity="0.5"/>
                  <line x1="12" y1="16.5" x2="12" y2="18" stroke="#fff" strokeWidth="1" opacity="0.5"/>
                  <line x1="7.5" y1="13.5" x2="9" y2="13.5" stroke="#fff" strokeWidth="1" opacity="0.5"/>
                  <line x1="15" y1="13.5" x2="16.5" y2="13.5" stroke="#fff" strokeWidth="1" opacity="0.5"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Take Photo</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Point your camera at food to scan</div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '20px',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--radius-md)',
                background: 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {/* Photo gallery / image icon */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="10" r="2" fill="var(--accent)" opacity="0.5"/>
                  <path d="M2 17l5-5 3 3 4-5 8 7" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="var(--accent)" fillOpacity="0.12"/>
                  <path d="M16 4v-1.5a1 1 0 011-1h3.5a1 1 0 011 1V5" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Upload Image</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>Choose a food photo from your library</div>
              </div>
            </button>
          </div>

          {/* Scan limit indicator */}
          {scansRemaining !== null && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: scansRemaining > 0 ? 'var(--accent-light)' : 'var(--danger-light)',
              border: `1px solid ${scansRemaining > 0 ? 'var(--accent)' : 'var(--danger)'}`,
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: scansRemaining > 0 ? 'var(--accent)' : 'var(--danger)' }}>
                {scansRemaining > 0
                  ? `${scansRemaining} free scan${scansRemaining !== 1 ? 's' : ''} remaining today`
                  : 'No free scans remaining. Subscribe for unlimited.'}
              </span>
            </div>
          )}

          {/* How it works */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>How it works</div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
                  <path d="M8.5 7L10 4h4l1.5 3" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="14" r="3.5" stroke="var(--accent)" strokeWidth="1.5"/>
                </svg>
              </div>
              <div style={{ paddingTop: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Snap or upload</div>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>Take a photo of your meal or pick from gallery</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--purple)" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M2 17l10 5 10-5" stroke="var(--purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12l10 5 10-5" stroke="var(--purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ paddingTop: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>AI analysis</div>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>Identifies foods and calculates purine content</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M21 5l-2-2M19 3v4h4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                </svg>
              </div>
              <div style={{ paddingTop: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Get results</div>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>Safety ratings, risk factors, and safer alternatives</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PREVIEW STATE ───────────────────────────────────────── */}
      {state === 'preview' && imageData && (
        <>
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            marginBottom: 16,
            position: 'relative',
          }}>
            <img
              src={imageData}
              alt="Food to analyze"
              style={{ width: '100%', height: 'auto', maxHeight: 320, objectFit: 'cover', display: 'block' }}
            />
            <button
              onClick={handleReset}
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 32, height: 32, borderRadius: 'var(--radius-full)',
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CloseIcon size={16} color="#fff" />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleReset} className="btn btn-secondary" style={{ flex: 1 }}>
              Retake
            </button>
            <button onClick={handleAnalyze} className="btn btn-primary" style={{ flex: 2 }}>
              <ScanIcon size={18} color="#fff" />
              Analyze Food
            </button>
          </div>
        </>
      )}

      {/* ── ANALYZING STATE ─────────────────────────────────────── */}
      {state === 'analyzing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 20 }}>
          {imageData && (
            <div style={{
              width: 120, height: 120, borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', border: '2px solid var(--accent)',
              boxShadow: '0 0 30px var(--accent-glow)',
            }}>
              <img src={imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div className="spinner spinner-lg" />
          <div style={{ fontSize: 16, fontWeight: 600 }}>Analyzing your food...</div>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', textAlign: 'center' }}>
            AI is identifying foods and calculating purine content
          </p>
        </div>
      )}

      {/* ── ERROR STATE ─────────────────────────────────────────── */}
      {state === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', gap: 16 }}>
          <div className="empty-icon" style={{ background: 'var(--danger-light)' }}>
            <AlertIcon size={28} color="var(--danger)" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Analysis Failed</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 280 }}>
            {error || 'Something went wrong. Please try again.'}
          </p>
          <button onClick={handleReset} className="btn btn-primary">
            Try Again
          </button>
        </div>
      )}

      {/* ── RESULTS STATE ───────────────────────────────────────── */}
      {state === 'results' && result && (
        <>
          {/* Image thumbnail + overall badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '16px', borderRadius: 'var(--radius-lg)',
            background: purineBgColor(result.purineLevel),
            border: `1.5px solid ${purineBadgeColor(result.purineLevel)}`,
            marginBottom: 20,
          }}>
            {imageData && (
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                <img src={imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                {result.foods.join(', ')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 'var(--radius-full)',
                  fontSize: 12, fontWeight: 700,
                  background: purineBadgeColor(result.purineLevel), color: '#fff',
                  textTransform: 'uppercase',
                }}>
                  {result.purineLevel.replace('-', ' ')}
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: purineBadgeColor(result.purineLevel) }}>
                  ~{result.estimatedPurine} mg
                </span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="section">
            <div className="section-label">Analysis</div>
            <div className="card">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Flare Safety */}
          <div className="section">
            <div className="section-label">During a Flare</div>
            <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <AlertIcon size={18} color="var(--warning)" />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {result.safetyDuringFlare}
              </p>
            </div>
          </div>

          {/* Risk Factors */}
          {result.riskFactors.length > 0 && (
            <div className="section">
              <div className="section-label">Risk Factors</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.riskFactors.map((risk, i) => (
                  <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: 'var(--radius-full)', background: 'var(--danger)', marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {result.benefits.length > 0 && (
            <div className="section">
              <div className="section-label">Benefits</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.benefits.map((b, i) => (
                  <div key={i} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: 'var(--radius-full)', background: 'var(--success)', marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives.length > 0 && (
            <div className="section">
              <div className="section-label">Safer Alternatives</div>
              <div className="card">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.alternatives.map((alt, i) => (
                    <span key={i} className="badge badge-success">{alt}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 16 }}>
            <button onClick={handleReset} className="btn btn-secondary" style={{ flex: 1 }}>
              Scan Again
            </button>
            <button
              onClick={handleSaveToLog}
              disabled={saved}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              {saved ? (
                <>
                  <CheckIcon size={18} color="#fff" />
                  Saved
                </>
              ) : (
                <>
                  <ForkKnifeIcon size={18} color="#fff" />
                  Add to Log
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <div className="toast toast-success" role="alert">{toast}</div>}
    </div>
  );
}
