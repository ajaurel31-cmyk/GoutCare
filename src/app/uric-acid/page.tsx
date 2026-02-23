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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-border)' }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-border)' }}
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
                  border: '1px solid var(--color-border)',
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
                      stroke="var(--color-surface)"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, stroke: 'var(--color-surface)', strokeWidth: 2 }}
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
      <div className="ua-container">
        <header className="ua-header">
          <div className="ua-header-left">
            <ChartIcon size={28} color="#6366f1" />
            <h1 className="ua-title">Uric Acid Tracker</h1>
          </div>
        </header>
        <div className="ua-empty-state">
          <div className="ua-empty-icon">
            <ChartIcon size={48} />
          </div>
          <h2 className="ua-empty-title">No Readings Yet</h2>
          <p className="ua-empty-text">
            Start tracking your uric acid levels to monitor your gout management progress.
          </p>
          <button className="ua-empty-button" onClick={openModal}>
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
      <div className="ua-modal-overlay" onClick={() => setShowModal(false)}>
        <div className="ua-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="ua-modal-title">Add Reading</h2>

          <label className="ua-label">Uric Acid Level (mg/dL)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g., 5.8"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            className="ua-input"
            autoFocus
          />

          <label className="ua-label">Date</label>
          <input
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            className="ua-input"
          />

          <label className="ua-label">Notes (optional)</label>
          <textarea
            placeholder="Any notes about this reading..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            className="ua-textarea"
            rows={3}
          />

          <div className="ua-modal-actions">
            <button className="ua-cancel-btn" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button
              className="ua-save-btn"
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
    <div className="ua-container">
      <header className="ua-header">
        <div className="ua-header-left">
          <ChartIcon size={28} color="#6366f1" />
          <h1 className="ua-title">Uric Acid Tracker</h1>
        </div>
      </header>

      {/* Target Display */}
      <div className="ua-target-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>
              Goal: Below {URIC_ACID_TARGET} mg/dL
            </div>
            {stats && (
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
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
              className="ua-value-badge"
              style={{
                background: getValueBg(stats.current),
                color: getValueColor(stats.current),
                fontSize: 22,
                fontWeight: 800,
                padding: '8px 14px',
                minWidth: 60,
                textAlign: 'center',
                borderRadius: 12,
              }}
            >
              {stats.current}
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="ua-chart-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingLeft: 8, paddingRight: 4 }}>
          <h2 className="ua-section-title">Trend</h2>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['1M', '3M', '6M', '1Y', 'All'] as TimeRange[]).map((r) => (
              <button
                key={r}
                className={`ua-range-btn ${timeRange === r ? 'ua-range-btn-active' : ''}`}
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
        <div className="ua-stats-row">
          <div className="ua-stat-card">
            <div className="ua-stat-value">
              <span style={{ color: getValueColor(stats.current) }}>{stats.current}</span>
            </div>
            <div className="ua-stat-label">Current</div>
          </div>
          <div className="ua-stat-card">
            <div className="ua-stat-value">
              <span style={{ color: getValueColor(stats.average) }}>{stats.average}</span>
            </div>
            <div className="ua-stat-label">Average</div>
          </div>
          <div className="ua-stat-card">
            <div className="ua-stat-value">
              <span style={{ color: getValueColor(stats.highest) }}>{stats.highest}</span>
            </div>
            <div className="ua-stat-label">Highest</div>
          </div>
          <div className="ua-stat-card">
            <div className="ua-stat-value">
              <span style={{ color: getValueColor(stats.lowest) }}>{stats.lowest}</span>
            </div>
            <div className="ua-stat-label">Lowest</div>
          </div>
        </div>
      )}

      {/* Reading History */}
      <div className="ua-history-section">
        <h2 className="ua-section-title">Reading History</h2>
        <div className="ua-history-list">
          {readings.map((r) => (
            <div key={r.id} className="ua-history-item">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
                  {formatDate(r.date)}
                </div>
                {r.notes && (
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.notes}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span
                  className="ua-value-badge"
                  style={{
                    background: getValueBg(r.value),
                    color: getValueColor(r.value),
                  }}
                >
                  {r.value} mg/dL
                </span>
                <button
                  className="ua-delete-btn"
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
      <button className="ua-fab" onClick={openModal} aria-label="Add Reading">
        <PlusIcon size={24} color="#fff" />
      </button>

      {/* Modal */}
      {showModal && renderModal()}
    </div>
  );
}
