'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { UricAcidReading } from '@/lib/types';
import {
  getUricAcidReadings,
  addUricAcidReading,
  deleteUricAcidReading,
} from '@/lib/storage';
import { formatDate, getToday } from '@/lib/utils';
import { getUricAcidColor, getUricAcidLabel } from '@/lib/utils';
import { URIC_ACID_TARGET, URIC_ACID_RANGES } from '@/lib/constants';
import PlusIcon from '@/components/icons/PlusIcon';
import ChartIcon from '@/components/icons/ChartIcon';

// ─── Dynamic Recharts (SSR-safe) ────────────────────────────────────────────

const RechartsLineChart = dynamic(
  () =>
    import('recharts').then((mod) => {
      const {
        LineChart,
        Line,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        ResponsiveContainer,
        ReferenceLine,
      } = mod;

      interface ChartPoint {
        date: string;
        label: string;
        value: number;
        color: string;
      }

      function UricAcidChart({ data }: { data: ChartPoint[] }) {
        return (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#999' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#999' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                unit=" "
              />
              <ReferenceLine
                y={URIC_ACID_TARGET}
                stroke="#22c55e"
                strokeDasharray="6 4"
                label={{
                  value: '6.0 Target',
                  position: 'insideTopRight',
                  fill: '#22c55e',
                  fontSize: 11,
                }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: 'var(--color-text)',
                }}
                formatter={(value: any) => [`${value} mg/dL`, 'Uric Acid']}
                labelFormatter={(label: any) => label}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={payload.date}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={payload.color}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      }
      return UricAcidChart;
    }),
  { ssr: false, loading: () => <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: 14 }}>Loading chart...</div> }
);

// ─── Time range options ─────────────────────────────────────────────────────

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'All';

function getDateThreshold(range: TimeRange): Date | null {
  if (range === 'All') return null;
  const now = new Date();
  switch (range) {
    case '1M':
      now.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      now.setMonth(now.getMonth() - 3);
      break;
    case '6M':
      now.setMonth(now.getMonth() - 6);
      break;
    case '1Y':
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  return now;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getValueColor(value: number): string {
  if (value < URIC_ACID_RANGES.normal) return '#22c55e';
  if (value < URIC_ACID_RANGES.elevated) return '#eab308';
  if (value < URIC_ACID_RANGES.high) return '#f97316';
  return '#ef4444';
}

function getValueBg(value: number): string {
  if (value < URIC_ACID_RANGES.normal) return 'rgba(34,197,94,0.15)';
  if (value < URIC_ACID_RANGES.elevated) return 'rgba(234,179,8,0.15)';
  if (value < URIC_ACID_RANGES.high) return 'rgba(249,115,22,0.15)';
  return 'rgba(239,68,68,0.15)';
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function UricAcidPage() {
  const [readings, setReadings] = useState<UricAcidReading[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('3M');
  const [mounted, setMounted] = useState(false);

  // Modal form state
  const [formValue, setFormValue] = useState('');
  const [formDate, setFormDate] = useState(getToday());
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    setMounted(true);
    setReadings(getUricAcidReadings());
  }, []);

  const openModal = useCallback(() => {
    setFormValue('');
    setFormDate(getToday());
    setFormNotes('');
    setShowModal(true);
  }, []);

  const handleSave = useCallback(() => {
    const val = parseFloat(formValue);
    if (isNaN(val) || val <= 0) return;

    const updated = addUricAcidReading({
      date: formDate,
      value: val,
      notes: formNotes.trim(),
    });
    setReadings(updated);
    setShowModal(false);
  }, [formValue, formDate, formNotes]);

  const handleDelete = useCallback((id: string) => {
    const updated = deleteUricAcidReading(id);
    setReadings(updated);
  }, []);

  // ─── Computed data ──────────────────────────────────────────────────────

  const filteredReadings = useMemo(() => {
    const threshold = getDateThreshold(timeRange);
    if (!threshold) return [...readings].reverse();
    return [...readings]
      .filter((r) => new Date(r.date) >= threshold)
      .reverse();
  }, [readings, timeRange]);

  const chartData = useMemo(() => {
    return filteredReadings.map((r) => ({
      date: r.date,
      label: new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: r.value,
      color: getValueColor(r.value),
    }));
  }, [filteredReadings]);

  const stats = useMemo(() => {
    if (readings.length === 0) return null;
    const values = readings.map((r) => r.value);
    return {
      current: readings[0].value,
      average: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)),
      highest: Math.max(...values),
      lowest: Math.min(...values),
    };
  }, [readings]);

  if (!mounted) return null;

  // ─── Empty State ────────────────────────────────────────────────────────

  if (readings.length === 0 && !showModal) {
    return (
      <div style={s.container}>
        <header style={s.header}>
          <ChartIcon size={28} color="#6366f1" />
          <h1 style={s.title}>Uric Acid Tracker</h1>
        </header>
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <ChartIcon size={48} color="#555" />
          </div>
          <h2 style={s.emptyTitle}>No Readings Yet</h2>
          <p style={s.emptyText}>
            Start tracking your uric acid levels to monitor your gout management progress.
          </p>
          <button style={s.emptyButton} onClick={openModal}>
            <PlusIcon size={18} color="#fff" />
            <span>Add Your First Reading</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Render helpers ─────────────────────────────────────────────────────

  function renderModal() {
    return (
      <div style={s.overlay} onClick={() => setShowModal(false)}>
        <div style={s.modal} onClick={(e) => e.stopPropagation()}>
          <h2 style={s.modalTitle}>Add Reading</h2>

          <label style={s.label}>Uric Acid Level (mg/dL)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g., 5.8"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            style={s.input}
            autoFocus
          />

          <label style={s.label}>Date</label>
          <input
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            style={s.input}
          />

          <label style={s.label}>Notes (optional)</label>
          <textarea
            placeholder="Any notes about this reading..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            style={s.textarea}
            rows={3}
          />

          <div style={s.modalActions}>
            <button style={s.cancelBtn} onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button
              style={{
                ...s.saveBtn,
                opacity: !formValue || parseFloat(formValue) <= 0 ? 0.5 : 1,
              }}
              onClick={handleSave}
              disabled={!formValue || parseFloat(formValue) <= 0}
            >
              Save Reading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────

  return (
    <div style={s.container}>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <ChartIcon size={28} color="#6366f1" />
          <h1 style={s.title}>Uric Acid Tracker</h1>
        </div>
      </header>

      {/* Target Display */}
      <div style={s.targetCard}>
        <div style={s.targetRow}>
          <div>
            <div style={s.targetLabel}>Goal: Below {URIC_ACID_TARGET} mg/dL</div>
            {stats && (
              <div style={s.targetSub}>
                Current Level:{' '}
                <span style={{ color: getValueColor(stats.current), fontWeight: 700 }}>
                  {stats.current} mg/dL
                </span>{' '}
                — {getUricAcidLabel(stats.current)}
              </div>
            )}
          </div>
          {stats && (
            <div
              style={{
                ...s.currentBadge,
                background: getValueBg(stats.current),
                color: getValueColor(stats.current),
              }}
            >
              {stats.current}
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div style={s.chartCard}>
        <div style={s.chartHeader}>
          <h2 style={s.sectionTitle}>Trend</h2>
          <div style={s.rangeButtons}>
            {(['1M', '3M', '6M', '1Y', 'All'] as TimeRange[]).map((r) => (
              <button
                key={r}
                style={{
                  ...s.rangeBtn,
                  ...(timeRange === r ? s.rangeBtnActive : {}),
                }}
                onClick={() => setTimeRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <RechartsLineChart data={chartData} />
        ) : (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
            No data for this time range
          </div>
        )}
      </div>

      {/* Stats Row */}
      {stats && (
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statValue}>
              <span style={{ color: getValueColor(stats.current) }}>{stats.current}</span>
            </div>
            <div style={s.statLabel}>Current</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>
              <span style={{ color: getValueColor(stats.average) }}>{stats.average}</span>
            </div>
            <div style={s.statLabel}>Average</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>
              <span style={{ color: getValueColor(stats.highest) }}>{stats.highest}</span>
            </div>
            <div style={s.statLabel}>Highest</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statValue}>
              <span style={{ color: getValueColor(stats.lowest) }}>{stats.lowest}</span>
            </div>
            <div style={s.statLabel}>Lowest</div>
          </div>
        </div>
      )}

      {/* Reading History */}
      <div style={s.historySection}>
        <h2 style={s.sectionTitle}>Reading History</h2>
        <div style={s.historyList}>
          {readings.map((r) => (
            <div key={r.id} style={s.historyItem}>
              <div style={s.historyLeft}>
                <div style={s.historyDate}>{formatDate(r.date)}</div>
                {r.notes && <div style={s.historyNotes}>{r.notes}</div>}
              </div>
              <div style={s.historyRight}>
                <div
                  style={{
                    ...s.valueBadge,
                    background: getValueBg(r.value),
                    color: getValueColor(r.value),
                  }}
                >
                  {r.value} mg/dL
                </div>
                <button
                  style={s.deleteBtn}
                  onClick={() => handleDelete(r.id)}
                  aria-label="Delete reading"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB */}
      <button style={s.fab} onClick={openModal} aria-label="Add Reading">
        <PlusIcon size={24} color="#fff" />
      </button>

      {/* Modal */}
      {showModal && renderModal()}
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
    gap: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },

  // Target
  targetCard: {
    margin: '12px 16px',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  targetRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: '#22c55e',
    marginBottom: 4,
  },
  targetSub: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  currentBadge: {
    fontSize: 22,
    fontWeight: 800,
    borderRadius: 12,
    padding: '8px 14px',
    minWidth: 60,
    textAlign: 'center' as const,
  },

  // Chart
  chartCard: {
    margin: '12px 16px',
    padding: '16px 12px 8px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingLeft: 8,
    paddingRight: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  rangeButtons: {
    display: 'flex',
    gap: 4,
  },
  rangeBtn: {
    padding: '4px 10px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  rangeBtnActive: {
    background: 'rgba(99,102,241,0.2)',
    color: '#818cf8',
  },

  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
    margin: '12px 16px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: '14px 8px',
    textAlign: 'center' as const,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 700,
  },
  statLabel: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    marginTop: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },

  // History
  historySection: {
    margin: '20px 16px',
  },
  historyList: {
    marginTop: 12,
    maxHeight: 400,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.06)',
  },
  historyLeft: {
    flex: 1,
    minWidth: 0,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  historyNotes: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    marginTop: 2,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  historyRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  valueBadge: {
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

  // FAB
  fab: {
    position: 'fixed' as const,
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 20,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20,
    color: 'var(--color-text)',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 6,
    marginTop: 14,
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
  modalActions: {
    display: 'flex',
    gap: 10,
    marginTop: 24,
  },
  cancelBtn: {
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
  saveBtn: {
    flex: 1,
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
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'var(--color-text)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
