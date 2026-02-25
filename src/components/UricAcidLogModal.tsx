'use client';

import { useState } from 'react';
import { CloseIcon, DropletIcon, CheckIcon } from '@/components/icons';
import { URIC_ACID_RANGES } from '@/lib/constants';
import { getToday } from '@/lib/utils';

interface Props {
  onClose: () => void;
  onSave: (reading: { date: string; value: number; notes: string }) => void;
}

export default function UricAcidLogModal({ onClose, onSave }: Props) {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(getToday());
  const [notes, setNotes] = useState('');

  const numValue = value ? parseFloat(value) : 0;
  const isValid = numValue > 0 && numValue < 20 && date;

  let statusColor = 'var(--success)';
  let statusLabel = 'Normal';
  if (numValue > URIC_ACID_RANGES.high) {
    statusColor = 'var(--danger)';
    statusLabel = 'High';
  } else if (numValue > URIC_ACID_RANGES.elevated) {
    statusColor = 'var(--warning)';
    statusLabel = 'Elevated';
  } else if (numValue > URIC_ACID_RANGES.normal) {
    statusColor = 'var(--warning)';
    statusLabel = 'Elevated';
  }

  const handleSave = () => {
    if (isValid) {
      onSave({ date, value: numValue, notes });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DropletIcon size={22} color="var(--accent)" />
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Log Uric Acid</h2>
          </div>
          <button onClick={onClose} style={{ padding: 4 }}>
            <CloseIcon size={20} color="var(--text-tertiary)" />
          </button>
        </div>

        {/* Value Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Reading (mg/dL)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 6.5"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              step="0.1"
              min="0"
              max="20"
              style={{ fontSize: 20, fontWeight: 700, paddingRight: 80 }}
            />
            {numValue > 0 && (
              <span style={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 13,
                fontWeight: 600,
                color: statusColor,
              }}>
                {statusLabel}
              </span>
            )}
          </div>
          {/* Reference Range */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Target: &lt;{URIC_ACID_RANGES.normal} mg/dL
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Elevated: {URIC_ACID_RANGES.normal}–{URIC_ACID_RANGES.elevated}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              High: &gt;{URIC_ACID_RANGES.elevated}
            </span>
          </div>
        </div>

        {/* Date Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Date
          </label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={getToday()}
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Notes (optional)
          </label>
          <input
            className="input"
            type="text"
            placeholder="e.g. Fasting blood test"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <button
          className="btn btn-primary btn-full btn-lg"
          disabled={!isValid}
          onClick={handleSave}
        >
          <CheckIcon size={18} color="#fff" />
          <span>Save Reading</span>
        </button>
      </div>
    </div>
  );
}
