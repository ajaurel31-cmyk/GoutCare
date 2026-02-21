'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoutFlare, Joint, Trigger, Treatment } from '@/lib/types';
import { getGoutFlares, addGoutFlare, deleteGoutFlare } from '@/lib/storage';
import { formatDate, getToday } from '@/lib/utils';
import { JOINT_LABELS, TRIGGER_LABELS, TREATMENT_LABELS } from '@/lib/constants';
import { isSubscribed } from '@/lib/subscription';
import FlameIcon from '@/components/icons/FlameIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import ChevronIcon from '@/components/icons/ChevronIcon';
import CrownIcon from '@/components/icons/CrownIcon';

// ─── Constants ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

function getPainColor(level: number): string {
  if (level <= 2) return '#22c55e';
  if (level <= 4) return '#84cc16';
  if (level <= 6) return '#eab308';
  if (level <= 8) return '#f97316';
  return '#ef4444';
}

function getPainBg(level: number): string {
  if (level <= 2) return 'rgba(34,197,94,0.15)';
  if (level <= 4) return 'rgba(132,204,22,0.15)';
  if (level <= 6) return 'rgba(234,179,8,0.15)';
  if (level <= 8) return 'rgba(249,115,22,0.15)';
  return 'rgba(239,68,68,0.15)';
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function FlaresPage() {
  const [flares, setFlares] = useState<GoutFlare[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [isPremium, setIsPremium] = useState(false);

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Form state
  const [formDate, setFormDate] = useState(getToday());
  const [formTime, setFormTime] = useState('12:00');
  const [formJoints, setFormJoints] = useState<Joint[]>([]);
  const [formPain, setFormPain] = useState(5);
  const [formDurationHours, setFormDurationHours] = useState(0);
  const [formDurationDays, setFormDurationDays] = useState(0);
  const [formTriggers, setFormTriggers] = useState<Trigger[]>([]);
  const [formTreatments, setFormTreatments] = useState<Treatment[]>([]);
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    setMounted(true);
    setFlares(getGoutFlares());
    setIsPremium(isSubscribed());
  }, []);

  const resetForm = useCallback(() => {
    setStep(1);
    setFormDate(getToday());
    setFormTime('12:00');
    setFormJoints([]);
    setFormPain(5);
    setFormDurationHours(0);
    setFormDurationDays(0);
    setFormTriggers([]);
    setFormTreatments([]);
    setFormNotes('');
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const handleSave = useCallback(() => {
    if (formJoints.length === 0) return;
    const updated = addGoutFlare({
      date: formDate,
      time: formTime,
      joints: formJoints,
      painLevel: formPain,
      durationHours: formDurationHours,
      durationDays: formDurationDays,
      triggers: formTriggers,
      treatments: formTreatments,
      notes: formNotes.trim(),
    });
    setFlares(updated);
    setShowModal(false);
  }, [formDate, formTime, formJoints, formPain, formDurationHours, formDurationDays, formTriggers, formTreatments, formNotes]);

  const handleDeleteFlare = useCallback((id: string) => {
    const updated = deleteGoutFlare(id);
    setFlares(updated);
  }, []);

  // Toggle helpers
  const toggleJoint = (j: Joint) =>
    setFormJoints((prev) => (prev.includes(j) ? prev.filter((x) => x !== j) : [...prev, j]));
  const toggleTrigger = (t: Trigger) =>
    setFormTriggers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const toggleTreatment = (t: Treatment) =>
    setFormTreatments((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  // ─── Calendar data ────────────────────────────────────────────────────

  const flareDates = useMemo(() => {
    const set = new Set<string>();
    flares.forEach((f) => set.add(f.date));
    return set;
  }, [flares]);

  const selectedDayFlares = useMemo(() => {
    if (!selectedDay) return [];
    return flares.filter((f) => f.date === selectedDay);
  }, [flares, selectedDay]);

  // ─── Analytics ────────────────────────────────────────────────────────

  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthFlares = flares.filter((f) => f.date.startsWith(thisMonth));

    const avgPain =
      flares.length > 0
        ? (flares.reduce((sum, f) => sum + f.painLevel, 0) / flares.length).toFixed(1)
        : '0';

    // Most affected joint
    const jointCount: Record<string, number> = {};
    flares.forEach((f) => f.joints.forEach((j) => (jointCount[j] = (jointCount[j] || 0) + 1)));
    const topJoint = Object.entries(jointCount).sort((a, b) => b[1] - a[1])[0];

    // Top trigger
    const triggerCount: Record<string, number> = {};
    flares.forEach((f) =>
      f.triggers.forEach((t) => (triggerCount[t] = (triggerCount[t] || 0) + 1))
    );
    const topTrigger = Object.entries(triggerCount).sort((a, b) => b[1] - a[1])[0];

    return {
      flaresThisMonth: monthFlares.length,
      avgPain,
      topJoint: topJoint ? JOINT_LABELS[topJoint[0]] || topJoint[0] : 'N/A',
      topTrigger: topTrigger ? TRIGGER_LABELS[topTrigger[0]] || topTrigger[0] : 'N/A',
    };
  }, [flares]);

  if (!mounted) return null;

  // ─── Calendar Render ──────────────────────────────────────────────────

  function renderCalendar() {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const cells: React.ReactNode[] = [];

    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // Blank cells
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`blank-${i}`} style={st.calCell} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasFlare = flareDates.has(dateStr);
      const isToday =
        d === today.getDate() &&
        calMonth === today.getMonth() &&
        calYear === today.getFullYear();
      const isSelected = dateStr === selectedDay;

      cells.push(
        <div
          key={dateStr}
          style={{
            ...st.calCell,
            ...(isToday ? st.calToday : {}),
            ...(isSelected ? st.calSelected : {}),
            cursor: 'pointer',
          }}
          onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
        >
          <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400 }}>{d}</span>
          {hasFlare && <div style={st.flareDot} />}
        </div>
      );
    }

    return (
      <div style={st.calendarCard}>
        <div style={st.calHeader}>
          <button
            style={st.calNavBtn}
            onClick={() => {
              if (calMonth === 0) {
                setCalMonth(11);
                setCalYear((y) => y - 1);
              } else {
                setCalMonth((m) => m - 1);
              }
            }}
          >
            <ChevronIcon size={18} direction="left" color="#ccc" />
          </button>
          <span style={st.calMonthLabel}>
            {MONTH_NAMES[calMonth]} {calYear}
          </span>
          <button
            style={st.calNavBtn}
            onClick={() => {
              if (calMonth === 11) {
                setCalMonth(0);
                setCalYear((y) => y + 1);
              } else {
                setCalMonth((m) => m + 1);
              }
            }}
          >
            <ChevronIcon size={18} direction="right" color="#ccc" />
          </button>
        </div>
        <div style={st.calDayLabels}>
          {dayLabels.map((l) => (
            <div key={l} style={st.calDayLabel}>
              {l}
            </div>
          ))}
        </div>
        <div style={st.calGrid}>{cells}</div>
        {selectedDay && selectedDayFlares.length > 0 && (
          <div style={st.calDetails}>
            <div style={st.calDetailsTitle}>
              Flares on {formatDate(selectedDay)}
            </div>
            {selectedDayFlares.map((f) => (
              <div key={f.id} style={st.calDetailItem}>
                <span style={{ color: getPainColor(f.painLevel), fontWeight: 700, fontSize: 13 }}>
                  Pain: {f.painLevel}/10
                </span>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
                  {f.joints.map((j) => JOINT_LABELS[j] || j).join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Modal Steps ──────────────────────────────────────────────────────

  function renderStepContent() {
    switch (step) {
      case 1:
        return (
          <>
            <h3 style={st.stepTitle}>When did the flare start?</h3>
            <label style={st.label}>Date</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              style={st.input}
            />
            <label style={{ ...st.label, marginTop: 14 }}>Time</label>
            <input
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              style={st.input}
            />
          </>
        );
      case 2:
        return (
          <>
            <h3 style={st.stepTitle}>Which joints are affected?</h3>
            <div style={st.chipGrid}>
              {Object.entries(JOINT_LABELS).map(([key, label]) => {
                const selected = formJoints.includes(key as Joint);
                return (
                  <button
                    key={key}
                    style={{
                      ...st.chip,
                      ...(selected ? st.chipSelected : {}),
                    }}
                    onClick={() => toggleJoint(key as Joint)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3 style={st.stepTitle}>Pain level</h3>
            <div style={st.painDisplay}>
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: getPainColor(formPain),
                }}
              >
                {formPain}
              </span>
              <span style={{ fontSize: 14, color: '#888' }}>/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={formPain}
              onChange={(e) => setFormPain(parseInt(e.target.value))}
              style={{
                ...st.slider,
                background: 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)',
              }}
            />
            <div style={st.sliderLabels}>
              <span>Mild</span>
              <span>Severe</span>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h3 style={st.stepTitle}>How long did it last?</h3>
            <div style={st.durationRow}>
              <div style={st.durationGroup}>
                <label style={st.label}>Hours</label>
                <select
                  value={formDurationHours}
                  onChange={(e) => setFormDurationHours(parseInt(e.target.value))}
                  style={st.select}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div style={st.durationGroup}>
                <label style={st.label}>Days</label>
                <select
                  value={formDurationDays}
                  onChange={(e) => setFormDurationDays(parseInt(e.target.value))}
                  style={st.select}
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h3 style={st.stepTitle}>Possible triggers?</h3>
            <div style={st.chipGrid}>
              {Object.entries(TRIGGER_LABELS).map(([key, label]) => {
                const selected = formTriggers.includes(key as Trigger);
                return (
                  <button
                    key={key}
                    style={{
                      ...st.chip,
                      ...(selected ? st.chipSelected : {}),
                    }}
                    onClick={() => toggleTrigger(key as Trigger)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        );
      case 6:
        return (
          <>
            <h3 style={st.stepTitle}>Treatments used?</h3>
            <div style={st.chipGrid}>
              {Object.entries(TREATMENT_LABELS).map(([key, label]) => {
                const selected = formTreatments.includes(key as Treatment);
                return (
                  <button
                    key={key}
                    style={{
                      ...st.chip,
                      ...(selected ? st.chipSelected : {}),
                    }}
                    onClick={() => toggleTreatment(key as Treatment)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        );
      case 7:
        return (
          <>
            <h3 style={st.stepTitle}>Additional notes</h3>
            <textarea
              placeholder="Any additional details about this flare..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              style={st.textarea}
              rows={4}
            />
          </>
        );
      default:
        return null;
    }
  }

  function renderModal() {
    return (
      <div style={st.overlay} onClick={() => setShowModal(false)}>
        <div style={st.modal} onClick={(e) => e.stopPropagation()}>
          <div style={st.modalHeader}>
            <h2 style={st.modalTitle}>Log Flare</h2>
            <div style={st.stepIndicator}>
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  style={{
                    ...st.stepDot,
                    background: i + 1 <= step ? '#6366f1' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={st.stepContent}>{renderStepContent()}</div>

          <div style={st.modalActions}>
            {step > 1 && (
              <button style={st.backBtn} onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                style={{
                  ...st.nextBtn,
                  opacity: step === 2 && formJoints.length === 0 ? 0.5 : 1,
                }}
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 2 && formJoints.length === 0}
              >
                Next
              </button>
            ) : (
              <button style={st.nextBtn} onClick={handleSave}>
                Save Flare
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────────

  if (flares.length === 0 && !showModal) {
    return (
      <div style={st.container}>
        <header style={st.header}>
          <FlameIcon size={28} color="#f97316" />
          <h1 style={st.titleText}>Flare Tracker</h1>
        </header>
        <div style={st.emptyState}>
          <div style={st.emptyIcon}>
            <FlameIcon size={48} color="#555" />
          </div>
          <h2 style={st.emptyTitle}>No Flares Logged</h2>
          <p style={st.emptyText}>
            Track your gout flares to identify patterns and triggers.
          </p>
          <button style={st.emptyButton} onClick={openModal}>
            <PlusIcon size={18} color="#fff" />
            <span>Log Your First Flare</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────

  return (
    <div style={st.container}>
      <header style={st.header}>
        <div style={st.headerLeft}>
          <FlameIcon size={28} color="#f97316" />
          <h1 style={st.titleText}>Flare Tracker</h1>
        </div>
        <button style={st.logBtn} onClick={openModal}>
          <PlusIcon size={16} color="#fff" />
          <span>Log Flare</span>
        </button>
      </header>

      {/* Calendar View */}
      {renderCalendar()}

      {/* Flare History */}
      <div style={st.section}>
        <h2 style={st.sectionTitle}>Flare History</h2>
        <div style={st.flareList}>
          {flares.map((f) => (
            <div key={f.id} style={st.flareCard}>
              <div style={st.flareTop}>
                <div>
                  <div style={st.flareDate}>{formatDate(f.date)}</div>
                  <div style={st.flareJoints}>
                    {f.joints.map((j) => JOINT_LABELS[j] || j).join(', ')}
                  </div>
                </div>
                <div style={st.flareRight}>
                  <div
                    style={{
                      ...st.painBadge,
                      background: getPainBg(f.painLevel),
                      color: getPainColor(f.painLevel),
                    }}
                  >
                    {f.painLevel}/10
                  </div>
                  <button
                    style={st.deleteBtn}
                    onClick={() => handleDeleteFlare(f.id)}
                    aria-label="Delete flare"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div style={st.flareMeta}>
                {(f.durationDays > 0 || f.durationHours > 0) && (
                  <span style={st.flareMetaItem}>
                    {f.durationDays > 0 ? `${f.durationDays}d ` : ''}
                    {f.durationHours > 0 ? `${f.durationHours}h` : ''}
                  </span>
                )}
                {f.triggers.length > 0 && (
                  <span style={st.flareMetaItem}>
                    Triggers: {f.triggers.map((t) => TRIGGER_LABELS[t] || t).join(', ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Section (Premium gated) */}
      <div style={st.section}>
        <div style={st.analyticsHeader}>
          <h2 style={st.sectionTitle}>Analytics</h2>
          {!isPremium && (
            <div style={st.premiumBadge}>
              <CrownIcon size={14} color="#eab308" />
              <span>Premium</span>
            </div>
          )}
        </div>
        {isPremium ? (
          <div style={st.analyticsGrid}>
            <div style={st.analyticCard}>
              <div style={st.analyticValue}>{analytics.flaresThisMonth}</div>
              <div style={st.analyticLabel}>Flares This Month</div>
            </div>
            <div style={st.analyticCard}>
              <div style={st.analyticValue}>{analytics.avgPain}</div>
              <div style={st.analyticLabel}>Avg Pain Level</div>
            </div>
            <div style={st.analyticCard}>
              <div style={st.analyticValue}>{analytics.topJoint}</div>
              <div style={st.analyticLabel}>Most Affected</div>
            </div>
            <div style={st.analyticCard}>
              <div style={st.analyticValue}>{analytics.topTrigger}</div>
              <div style={st.analyticLabel}>Top Trigger</div>
            </div>
          </div>
        ) : (
          <div style={st.premiumGate}>
            <CrownIcon size={32} color="#eab308" />
            <p style={st.premiumText}>
              Upgrade to Premium to unlock flare analytics, pattern detection, and insights.
            </p>
            <button style={st.upgradeBtn}>Unlock Analytics</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && renderModal()}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const st: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    paddingBottom: 100,
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px 8px',
    position: 'sticky',
    top: 0,
    background: 'var(--color-bg)',
    zIndex: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  logBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #f97316, #ef4444)',
    color: 'var(--color-text)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Calendar
  calendarCard: {
    margin: '12px 16px',
    padding: '16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  calHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calNavBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calMonthLabel: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  calDayLabels: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
    marginBottom: 4,
  },
  calDayLabel: {
    textAlign: 'center' as const,
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    padding: '4px 0',
    fontWeight: 600,
  },
  calGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 2,
  },
  calCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
    position: 'relative' as const,
    color: 'var(--color-text)',
  },
  calToday: {
    background: 'rgba(99,102,241,0.15)',
    color: '#818cf8',
  },
  calSelected: {
    background: 'rgba(99,102,241,0.3)',
    outline: '2px solid #6366f1',
    outlineOffset: -2,
  },
  flareDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#f97316',
    position: 'absolute' as const,
    bottom: 4,
  },
  calDetails: {
    marginTop: 12,
    padding: '12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
  },
  calDetailsTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: 8,
  },
  calDetailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },

  // Section
  section: {
    margin: '20px 16px',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: 12,
  },

  // Flare list
  flareList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    maxHeight: 400,
    overflowY: 'auto' as const,
  },
  flareCard: {
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  flareTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  flareDate: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  flareJoints: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    marginTop: 2,
  },
  flareRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  painBadge: {
    fontSize: 13,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 8,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-tertiary)',
    fontSize: 20,
    cursor: 'pointer',
    padding: '4px 6px',
    lineHeight: 1,
  },
  flareMeta: {
    display: 'flex',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap' as const,
  },
  flareMetaItem: {
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
  },

  // Analytics
  analyticsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  premiumBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 6,
    background: 'rgba(234,179,8,0.15)',
    color: '#eab308',
    fontSize: 11,
    fontWeight: 600,
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
  },
  analyticCard: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: '16px',
    textAlign: 'center' as const,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  analyticValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f97316',
  },
  analyticLabel: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    marginTop: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  premiumGate: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '32px 20px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    border: '1px solid rgba(234,179,8,0.2)',
    textAlign: 'center' as const,
  },
  premiumText: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    marginTop: 12,
    marginBottom: 16,
    maxWidth: 260,
    lineHeight: 1.5,
  },
  upgradeBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #eab308, #f59e0b)',
    color: '#000',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },

  // Modal
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: 'var(--color-surface)',
    borderRadius: '20px 20px 0 0',
    padding: '24px 20px 32px',
    width: '100%',
    maxWidth: 480,
    maxHeight: '85vh',
    overflowY: 'auto' as const,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 12,
  },
  stepIndicator: {
    display: 'flex',
    gap: 6,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'background 0.2s',
  },
  stepContent: {
    minHeight: 180,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--color-text)',
    fontSize: 15,
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--color-text)',
    fontSize: 15,
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--color-text)',
    fontSize: 15,
    outline: 'none',
  },
  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  chip: {
    padding: '8px 16px',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: 'var(--color-text)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  chipSelected: {
    background: 'rgba(99,102,241,0.2)',
    borderColor: '#6366f1',
    color: '#a5b4fc',
  },
  painDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    appearance: 'auto' as const,
    cursor: 'pointer',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    marginTop: 6,
  },
  durationRow: {
    display: 'flex',
    gap: 16,
  },
  durationGroup: {
    flex: 1,
  },
  modalActions: {
    display: 'flex',
    gap: 10,
    marginTop: 24,
  },
  backBtn: {
    flex: 1,
    padding: '12px 0',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: 'var(--color-text)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  nextBtn: {
    flex: 2,
    padding: '12px 0',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'var(--color-text)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Empty
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 32px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    maxWidth: 280,
    lineHeight: 1.5,
    marginBottom: 24,
  },
  emptyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 24px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #f97316, #ef4444)',
    color: 'var(--color-text)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
