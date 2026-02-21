'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DropletIcon, PlusIcon, ChevronIcon, CloseIcon } from '@/components/icons';
import { getWaterIntake, addWaterEntry, getUserProfile } from '@/lib/storage';
import { getToday, formatTime } from '@/lib/utils';
import { WATER_AMOUNTS } from '@/lib/constants';
import type { WaterIntake } from '@/lib/types';

const WaterChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine } = mod;
      return function Chart({ data, goal }: { data: { day: string; amount: number }[]; goal: number }) {
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine y={goal} stroke="var(--color-accent)" strokeDasharray="4 4" />
              <Bar dataKey="amount" fill="var(--color-cyan)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
        Loading chart...
      </div>
    ),
  }
);

export default function HydrationPage() {
  const router = useRouter();
  const [intake, setIntake] = useState<WaterIntake | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [weekData, setWeekData] = useState<{ day: string; amount: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    const today = getToday();
    const currentIntake = getWaterIntake(today);
    setIntake(currentIntake);

    // Load last 7 days for chart
    const days: { day: string; amount: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayIntake = getWaterIntake(dateStr);
      days.push({
        day: dayNames[d.getDay()],
        amount: dayIntake.total,
      });
    }
    setWeekData(days);
  }, []);

  useEffect(() => {
    loadData();
    setMounted(true);
  }, [loadData]);

  const handleAddWater = (amount: number) => {
    const today = getToday();
    addWaterEntry(today, amount);
    loadData();
  };

  const handleAddCustom = () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      handleAddWater(amount);
      setCustomAmount('');
      setShowCustom(false);
    }
  };

  if (!mounted || !intake) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const percent = intake.goal > 0 ? Math.min((intake.total / intake.goal) * 100, 100) : 0;
  const profile = getUserProfile();
  const goal = profile.waterGoal;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const ringColor = percent >= 100 ? 'var(--color-success)' : 'var(--color-cyan)';

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button onClick={() => router.back()} style={s.backBtn}>
            <ChevronIcon size={20} color="var(--color-text-secondary)" />
          </button>
          <DropletIcon size={24} color="var(--color-cyan)" />
          <span style={s.titleText}>Hydration</span>
        </div>
      </div>

      {/* Progress Ring */}
      <div style={s.ringSection}>
        <div style={s.ringWrapper}>
          <svg width={180} height={180} viewBox="0 0 180 180">
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="10"
            />
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={s.ringCenter}>
            <span style={{ ...s.ringValue, color: ringColor }}>{intake.total}</span>
            <span style={s.ringUnit}>/ {goal} oz</span>
          </div>
        </div>
        <p style={s.ringLabel}>
          {percent >= 100
            ? 'Goal reached! Great job staying hydrated.'
            : `${Math.max(0, goal - intake.total)} oz remaining today`}
        </p>
      </div>

      {/* Quick Add Buttons */}
      <div style={s.quickSection}>
        <span style={s.sectionTitle}>Quick Add</span>
        <div style={s.quickGrid}>
          {WATER_AMOUNTS.map((w) => (
            <button
              key={w.amount}
              onClick={() => handleAddWater(w.amount)}
              style={s.quickBtn}
            >
              <DropletIcon size={18} color="var(--color-cyan)" />
              <span style={s.quickLabel}>{w.label}</span>
            </button>
          ))}
          <button onClick={() => setShowCustom(true)} style={s.quickBtn}>
            <PlusIcon size={18} color="var(--color-accent)" />
            <span style={s.quickLabel}>Custom</span>
          </button>
        </div>
      </div>

      {/* Custom Amount Modal */}
      {showCustom && (
        <div style={s.overlay} onClick={() => setShowCustom(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalTop}>
              <span style={s.modalTitle}>Custom Amount</span>
              <button onClick={() => setShowCustom(false)} style={s.closeBtn}>
                <CloseIcon size={20} color="var(--color-text-secondary)" />
              </button>
            </div>
            <label style={s.label}>Amount (oz)</label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount in oz"
              style={s.input}
              autoFocus
            />
            <div style={s.modalActions}>
              <button onClick={() => setShowCustom(false)} style={s.cancelBtn}>Cancel</button>
              <button onClick={handleAddCustom} style={s.saveBtn}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      <div style={s.chartSection}>
        <span style={s.sectionTitle}>Last 7 Days</span>
        <div style={s.chartCard}>
          <WaterChart data={weekData} goal={goal} />
        </div>
      </div>

      {/* Today's Log */}
      <div style={s.logSection}>
        <span style={s.sectionTitle}>Today&apos;s Log</span>
        {intake.entries.length === 0 ? (
          <div style={s.emptyCard}>
            <DropletIcon size={28} color="var(--color-text-tertiary)" />
            <p style={s.emptyText}>No water logged yet today</p>
          </div>
        ) : (
          <div style={s.logList}>
            {[...intake.entries].reverse().map((entry) => (
              <div key={entry.id} style={s.logItem}>
                <div style={s.logLeft}>
                  <DropletIcon size={16} color="var(--color-cyan)" />
                  <span style={s.logAmount}>{entry.amount} oz</span>
                </div>
                <span style={s.logTime}>{formatTime(entry.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
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
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(180deg)',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },

  // Progress Ring
  ringSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px 8px',
  },
  ringWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
  },
  ringCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 36,
    fontWeight: 800,
  },
  ringUnit: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    marginTop: 2,
  },
  ringLabel: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    marginTop: 12,
    textAlign: 'center',
  },

  // Quick Add
  quickSection: {
    padding: '20px 16px 0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
    display: 'block',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
  },
  quickBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '16px 8px',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    cursor: 'pointer',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text)',
  },

  // Chart
  chartSection: {
    padding: '24px 16px 0',
  },
  chartCard: {
    padding: '12px 4px 4px',
    background: 'var(--color-surface)',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
  },

  // Log
  logSection: {
    padding: '24px 16px 0',
  },
  logList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  logItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: 'var(--color-surface)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
  },
  logLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logAmount: {
    fontSize: 14,
    fontWeight: 600,
  },
  logTime: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  emptyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 16px',
    background: 'var(--color-surface)',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
  },
  emptyText: {
    fontSize: 14,
    color: 'var(--color-text-tertiary)',
    marginTop: 10,
  },

  // Modal
  overlay: {
    position: 'fixed',
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
  },
  modalTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
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
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: 15,
    outline: 'none',
  },
  modalActions: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: '12px 0',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 1,
    padding: '12px 0',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, var(--color-cyan), #0891b2)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
