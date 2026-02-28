'use client';

import { useState } from 'react';
import { CloseIcon, FlameIcon, CheckIcon } from '@/components/icons';
import { JOINT_LABELS, TRIGGER_LABELS, TREATMENT_LABELS } from '@/lib/constants';
import { getToday } from '@/lib/utils';
import type { Joint, Trigger, Treatment } from '@/lib/types';

interface FlareData {
  date: string;
  time: string;
  joints: Joint[];
  painLevel: number;
  durationHours: number;
  durationDays: number;
  triggers: Trigger[];
  treatments: Treatment[];
  notes: string;
}

interface Props {
  onClose: () => void;
  onSave: (flare: FlareData) => void;
}

function ChipSelect<T extends string>({
  options,
  labels,
  selected,
  onToggle,
  color,
}: {
  options: T[];
  labels: Record<string, string>;
  selected: T[];
  onToggle: (value: T) => void;
  color: string;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 600,
              background: active ? color : 'var(--bg-input)',
              color: active ? '#fff' : 'var(--text-secondary)',
              border: `1.5px solid ${active ? color : 'var(--border-strong)'}`,
              transition: 'all var(--transition)',
            }}
          >
            {labels[opt]}
          </button>
        );
      })}
    </div>
  );
}

export default function FlareLogModal({ onClose, onSave }: Props) {
  const [date, setDate] = useState(getToday());
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [joints, setJoints] = useState<Joint[]>([]);
  const [painLevel, setPainLevel] = useState(5);
  const [durationHours, setDurationHours] = useState(0);
  const [durationDays, setDurationDays] = useState(0);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [notes, setNotes] = useState('');

  const isValid = joints.length > 0 && painLevel > 0;

  const toggleItem = <T extends string>(list: T[], setList: (v: T[]) => void, item: T) => {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSave = () => {
    if (isValid) {
      onSave({ date, time, joints, painLevel, durationHours, durationDays, triggers, treatments, notes });
    }
  };

  const painColor = painLevel <= 3 ? 'var(--success)' : painLevel <= 6 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FlameIcon size={22} color="var(--orange)" />
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Log Flare</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ padding: 4 }}>
            <CloseIcon size={20} color="var(--text-tertiary)" />
          </button>
        </div>

        {/* Date & Time */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} max={getToday()} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Time</label>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        {/* Affected Joints */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Affected Joints
          </label>
          <ChipSelect
            options={Object.keys(JOINT_LABELS) as Joint[]}
            labels={JOINT_LABELS}
            selected={joints}
            onToggle={(j) => toggleItem(joints, setJoints, j)}
            color="var(--orange)"
          />
        </div>

        {/* Pain Level */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Pain Level: <span style={{ color: painColor, fontWeight: 800 }}>{painLevel}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            aria-label="Pain level"
            style={{
              width: '100%',
              height: 6,
              borderRadius: 'var(--radius-full)',
              appearance: 'none',
              WebkitAppearance: 'none',
              background: `linear-gradient(to right, var(--success), var(--warning), var(--danger))`,
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Mild</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Moderate</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Severe</span>
          </div>
        </div>

        {/* Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Hours</label>
            <input className="input" type="number" inputMode="numeric" placeholder="0" value={durationHours || ''} onChange={(e) => { const v = Number(e.target.value); if (v >= 0 && v <= 23) setDurationHours(v); }} min="0" max="23" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Days</label>
            <input className="input" type="number" inputMode="numeric" placeholder="0" value={durationDays || ''} onChange={(e) => { const v = Number(e.target.value); if (v >= 0 && v <= 90) setDurationDays(v); }} min="0" max="90" />
          </div>
        </div>

        {/* Triggers */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Possible Triggers
          </label>
          <ChipSelect
            options={Object.keys(TRIGGER_LABELS) as Trigger[]}
            labels={TRIGGER_LABELS}
            selected={triggers}
            onToggle={(t) => toggleItem(triggers, setTriggers, t)}
            color="var(--warning)"
          />
        </div>

        {/* Treatments */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Treatments Used
          </label>
          <ChipSelect
            options={Object.keys(TREATMENT_LABELS) as Treatment[]}
            labels={TREATMENT_LABELS}
            selected={treatments}
            onToggle={(t) => toggleItem(treatments, setTreatments, t)}
            color="var(--accent)"
          />
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Notes (optional)
          </label>
          <input className="input" type="text" placeholder="Any additional details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Save Button */}
        <button
          className="btn btn-full btn-lg"
          disabled={!isValid}
          onClick={handleSave}
          style={{
            background: isValid ? 'var(--orange)' : undefined,
            color: isValid ? '#fff' : undefined,
            boxShadow: isValid ? '0 2px 10px rgba(249,115,22,0.25)' : undefined,
            opacity: isValid ? 1 : 0.4,
          }}
        >
          <CheckIcon size={18} color="#fff" />
          <span>Log Flare</span>
        </button>
      </div>
    </div>
  );
}
