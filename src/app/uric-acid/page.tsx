'use client';

import { useState, useCallback, useEffect } from 'react';
import { DropletIcon, FlameIcon, PlusIcon, CloseIcon } from '@/components/icons';
import {
  getUricAcidReadings,
  addUricAcidReading,
  deleteUricAcidReading,
  getGoutFlares,
  addGoutFlare,
  deleteGoutFlare,
} from '@/lib/storage';
import { URIC_ACID_RANGES, JOINT_LABELS, TRIGGER_LABELS, TREATMENT_LABELS } from '@/lib/constants';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import type { UricAcidReading, GoutFlare } from '@/lib/types';

import UricAcidLogModal from '@/components/UricAcidLogModal';
import FlareLogModal from '@/components/FlareLogModal';

type Tab = 'uricAcid' | 'flares';
type ModalType = 'uricAcid' | 'flare' | null;

function uaColor(value: number): string {
  if (value <= URIC_ACID_RANGES.normal) return 'var(--success)';
  if (value <= URIC_ACID_RANGES.elevated) return 'var(--warning)';
  return 'var(--danger)';
}

function uaLabel(value: number): string {
  if (value <= URIC_ACID_RANGES.normal) return 'Normal';
  if (value <= URIC_ACID_RANGES.elevated) return 'Elevated';
  return 'High';
}

function painColor(level: number): string {
  if (level <= 3) return 'var(--success)';
  if (level <= 6) return 'var(--warning)';
  return 'var(--danger)';
}

// Simple inline chart — no recharts dependency for SSR safety
function MiniChart({ readings }: { readings: UricAcidReading[] }) {
  if (readings.length < 2) return null;

  const data = [...readings].reverse().slice(-12);
  const values = data.map((r) => r.value);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = max - min || 1;

  const width = 320;
  const height = 140;
  const padX = 10;
  const padY = 16;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = data.map((r, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
    y: padY + chartH - ((r.value - min) / range) * chartH,
    value: r.value,
    date: r.date,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Target line at 6.0
  const targetY = padY + chartH - ((URIC_ACID_RANGES.normal - min) / range) * chartH;
  const targetInView = targetY >= padY && targetY <= padY + chartH;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Trend</div>
      <div className="card" style={{ padding: '16px 12px', overflow: 'hidden' }}>
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
          {/* Target line */}
          {targetInView && (
            <>
              <line x1={padX} y1={targetY} x2={width - padX} y2={targetY} stroke="var(--success)" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
              <text x={width - padX} y={targetY - 4} textAnchor="end" fontSize="9" fill="var(--success)" opacity="0.7">
                Target {URIC_ACID_RANGES.normal}
              </text>
            </>
          )}

          {/* Line */}
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill={uaColor(p.value)} stroke="var(--bg-card)" strokeWidth="2" />
              {(i === 0 || i === points.length - 1) && (
                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text)">
                  {p.value.toFixed(1)}
                </text>
              )}
            </g>
          ))}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{formatDate(data[0].date)}</span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{formatDate(data[data.length - 1].date)}</span>
        </div>
      </div>
    </div>
  );
}

export default function TrackerPage() {
  const [tab, setTab] = useState<Tab>('uricAcid');
  const [readings, setReadings] = useState<UricAcidReading[]>([]);
  const [flares, setFlares] = useState<GoutFlare[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setReadings(getUricAcidReadings());
    setFlares(getGoutFlares());
  }, []);

  useEffect(() => {
    refresh();
    setMounted(true);
  }, [refresh]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleUASave = (reading: { date: string; value: number; notes: string }) => {
    addUricAcidReading(reading);
    setActiveModal(null);
    refresh();
    showToast(`Logged ${reading.value} mg/dL`);
  };

  const handleFlareSave = (flare: Parameters<typeof addGoutFlare>[0]) => {
    addGoutFlare(flare);
    setActiveModal(null);
    refresh();
    showToast('Flare logged');
  };

  const handleDeleteReading = (id: string) => {
    deleteUricAcidReading(id);
    refresh();
    showToast('Reading deleted');
  };

  const handleDeleteFlare = (id: string) => {
    deleteGoutFlare(id);
    refresh();
    showToast('Flare deleted');
  };

  if (!mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  // Summary stats
  const latestUA = readings.length > 0 ? readings[0] : null;
  const avgUA = readings.length > 0 ? readings.reduce((s, r) => s + r.value, 0) / readings.length : 0;
  const inRange = readings.filter((r) => r.value <= URIC_ACID_RANGES.normal).length;
  const totalFlares = flares.length;

  return (
    <div style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 16 }}>Health Tracker</h1>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 20 }}>
        <button
          onClick={() => setTab('uricAcid')}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600,
            background: tab === 'uricAcid' ? 'var(--bg-card)' : 'transparent',
            color: tab === 'uricAcid' ? 'var(--accent)' : 'var(--text-tertiary)',
            boxShadow: tab === 'uricAcid' ? 'var(--shadow-sm)' : 'none',
            transition: 'all var(--transition)',
          }}
        >
          Uric Acid
        </button>
        <button
          onClick={() => setTab('flares')}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600,
            background: tab === 'flares' ? 'var(--bg-card)' : 'transparent',
            color: tab === 'flares' ? 'var(--orange)' : 'var(--text-tertiary)',
            boxShadow: tab === 'flares' ? 'var(--shadow-sm)' : 'none',
            transition: 'all var(--transition)',
          }}
        >
          Flares
        </button>
      </div>

      {tab === 'uricAcid' ? (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Latest</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: latestUA ? uaColor(latestUA.value) : 'var(--text-tertiary)', marginTop: 4 }}>
                {latestUA ? `${latestUA.value.toFixed(1)}` : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>mg/dL</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Average</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: readings.length > 0 ? uaColor(avgUA) : 'var(--text-tertiary)', marginTop: 4 }}>
                {readings.length > 0 ? avgUA.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>mg/dL</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>In Range</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
                {readings.length > 0 ? `${Math.round((inRange / readings.length) * 100)}%` : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>&le;{URIC_ACID_RANGES.normal}</div>
            </div>
          </div>

          {/* Chart */}
          <MiniChart readings={readings} />

          {/* Readings List */}
          <div className="section">
            <div className="section-label">Readings ({readings.length})</div>
            {readings.length === 0 ? (
              <div className="empty-state" style={{ minHeight: '20vh' }}>
                <div className="empty-icon"><DropletIcon size={24} /></div>
                <div className="empty-title">No readings yet</div>
                <div className="empty-text">Tap + to log your first uric acid reading.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {readings.map((r) => (
                  <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{formatDate(r.date)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {formatRelativeDate(r.date)}
                        {r.notes ? ` · ${r.notes}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: uaColor(r.value) }}>{r.value.toFixed(1)}</span>
                        <div style={{ fontSize: 11, fontWeight: 600, color: uaColor(r.value) }}>{uaLabel(r.value)}</div>
                      </div>
                      <button onClick={() => handleDeleteReading(r.id)} style={{ padding: 4, opacity: 0.4 }}>
                        <CloseIcon size={14} color="var(--text-tertiary)" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Flare Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
            <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Flares</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--orange)', marginTop: 4 }}>{totalFlares}</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Pain</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: flares.length > 0 ? painColor(flares.reduce((s, f) => s + f.painLevel, 0) / flares.length) : 'var(--text-tertiary)', marginTop: 4 }}>
                {flares.length > 0 ? (flares.reduce((s, f) => s + f.painLevel, 0) / flares.length).toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>/ 10</div>
            </div>
          </div>

          {/* Flares List */}
          <div className="section">
            <div className="section-label">Flare History ({flares.length})</div>
            {flares.length === 0 ? (
              <div className="empty-state" style={{ minHeight: '20vh' }}>
                <div className="empty-icon"><FlameIcon size={24} /></div>
                <div className="empty-title">No flares logged</div>
                <div className="empty-text">Tap + to log a gout flare event.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {flares.map((f) => (
                  <div key={f.id} className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{formatDate(f.date)}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{formatRelativeDate(f.date)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 13,
                          fontWeight: 700,
                          background: painColor(f.painLevel),
                          color: '#fff',
                        }}>
                          {f.painLevel}/10
                        </div>
                        <button onClick={() => handleDeleteFlare(f.id)} style={{ padding: 4, opacity: 0.4 }}>
                          <CloseIcon size={14} color="var(--text-tertiary)" />
                        </button>
                      </div>
                    </div>

                    {/* Joints */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {f.joints.map((j) => (
                        <span key={j} className="badge badge-warning">{JOINT_LABELS[j] || j}</span>
                      ))}
                    </div>

                    {/* Duration */}
                    {(f.durationHours > 0 || f.durationDays > 0) && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Duration: {f.durationDays > 0 ? `${f.durationDays}d ` : ''}{f.durationHours > 0 ? `${f.durationHours}h` : ''}
                      </div>
                    )}

                    {/* Triggers */}
                    {f.triggers.length > 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                        Triggers: {f.triggers.map((t) => TRIGGER_LABELS[t] || t).join(', ')}
                      </div>
                    )}

                    {/* Treatments */}
                    {f.treatments.length > 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                        Treatments: {f.treatments.map((t) => TREATMENT_LABELS[t] || t).join(', ')}
                      </div>
                    )}

                    {/* Notes */}
                    {f.notes && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 4 }}>
                        {f.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setActiveModal(tab === 'uricAcid' ? 'uricAcid' : 'flare')}>
        <PlusIcon size={24} color="#fff" />
      </button>

      {/* Modals */}
      {activeModal === 'uricAcid' && (
        <UricAcidLogModal onClose={() => setActiveModal(null)} onSave={handleUASave} />
      )}
      {activeModal === 'flare' && (
        <FlareLogModal onClose={() => setActiveModal(null)} onSave={handleFlareSave} />
      )}

      {/* Toast */}
      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}
