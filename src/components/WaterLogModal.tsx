'use client';

import { useState } from 'react';
import { CloseIcon, DropletIcon, CheckIcon } from '@/components/icons';
import { WATER_AMOUNTS } from '@/lib/constants';

interface Props {
  onClose: () => void;
  onSave: (amount: number) => void;
}

export default function WaterLogModal({ onClose, onSave }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');

  const amount = selected ?? (custom ? Number(custom) : 0);

  const handleSave = () => {
    if (amount > 0) {
      onSave(amount);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DropletIcon size={22} color="var(--cyan)" />
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Log Water</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ padding: 4 }}>
            <CloseIcon size={20} color="var(--text-tertiary)" />
          </button>
        </div>

        {/* Preset Amounts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {WATER_AMOUNTS.map((w) => (
            <button
              key={w.amount}
              onClick={() => { setSelected(w.amount); setCustom(''); }}
              style={{
                padding: '16px 12px',
                borderRadius: 'var(--radius-md)',
                background: selected === w.amount ? 'var(--cyan)' : 'var(--bg-input)',
                border: `1.5px solid ${selected === w.amount ? 'var(--cyan)' : 'var(--border-strong)'}`,
                color: selected === w.amount ? '#fff' : 'var(--text)',
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                gap: 4,
                transition: 'all var(--transition)',
              }}
            >
              <DropletIcon size={20} color={selected === w.amount ? '#fff' : 'var(--cyan)'} />
              <span style={{ fontSize: 16, fontWeight: 700 }}>{w.amount} oz</span>
              <span style={{ fontSize: 12, color: selected === w.amount ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)' }}>{w.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Custom amount (oz)
          </label>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            placeholder="Enter amount..."
            value={custom}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || (Number(v) >= 0 && Number(v) <= 128)) {
                setCustom(v);
                setSelected(null);
              }
            }}
            min="1"
            max="128"
          />
        </div>

        {/* Save Button */}
        <button
          className="btn btn-primary btn-full btn-lg"
          disabled={amount <= 0}
          onClick={handleSave}
          style={{ background: 'var(--cyan)', boxShadow: '0 2px 10px rgba(6,182,212,0.25)' }}
        >
          <CheckIcon size={18} color="#fff" />
          <span>Add {amount > 0 ? `${amount} oz` : 'Water'}</span>
        </button>
      </div>
    </div>
  );
}
