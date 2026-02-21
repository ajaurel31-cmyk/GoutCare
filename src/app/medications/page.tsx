'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PillIcon,
  PlusIcon,
  CheckIcon,
  CloseIcon,
  ChevronIcon,
  AlertIcon,
} from '@/components/icons';
import {
  getMedications,
  addMedication,
  deleteMedication,
  getDoseLogs,
  logDose,
} from '@/lib/storage';
import { MEDICATION_PRESETS, DRUG_INTERACTIONS } from '@/lib/constants';
import { getToday } from '@/lib/utils';
import type { Medication, DoseLog } from '@/lib/types';

export default function MedicationsPage() {
  const router = useRouter();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTimes, setNewTimes] = useState<string[]>(['08:00']);
  const [showPresets, setShowPresets] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    const meds = getMedications();
    setMedications(meds);
    const today = getToday();
    const logs = getDoseLogs(today);
    setDoseLogs(logs);
  }, []);

  useEffect(() => {
    loadData();
    setMounted(true);
  }, [loadData]);

  const handleAddMedication = () => {
    if (!newName.trim()) return;
    addMedication({
      name: newName.trim(),
      dosage: newDosage.trim(),
      reminderTimes: newTimes.filter((t) => t),
      isActive: true,
    });
    setNewName('');
    setNewDosage('');
    setNewTimes(['08:00']);
    setShowAddForm(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this medication?')) {
      deleteMedication(id);
      loadData();
    }
  };

  const handleToggleDose = (medicationId: string, time: string) => {
    const today = getToday();
    const existing = doseLogs.find(
      (l) => l.medicationId === medicationId && l.time === time
    );
    logDose({
      medicationId,
      date: today,
      time,
      taken: existing ? !existing.taken : true,
    });
    loadData();
  };

  const isDoseTaken = (medicationId: string, time: string): boolean => {
    return doseLogs.some(
      (l) => l.medicationId === medicationId && l.time === time && l.taken
    );
  };

  const addTimeSlot = () => {
    setNewTimes([...newTimes, '']);
  };

  const updateTimeSlot = (index: number, value: string) => {
    const updated = [...newTimes];
    updated[index] = value;
    setNewTimes(updated);
  };

  const removeTimeSlot = (index: number) => {
    if (newTimes.length <= 1) return;
    setNewTimes(newTimes.filter((_, i) => i !== index));
  };

  const getInteractions = (name: string): string[] => {
    for (const [drugName, warnings] of Object.entries(DRUG_INTERACTIONS)) {
      if (name.toLowerCase().includes(drugName.toLowerCase())) {
        return warnings;
      }
    }
    return [];
  };

  const formatTimeLabel = (time: string): string => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  if (!mounted) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div style={st.container}>
      {/* Header */}
      <div style={st.header}>
        <div style={st.headerLeft}>
          <button onClick={() => router.back()} style={st.backBtn}>
            <ChevronIcon size={20} color="var(--color-text-secondary)" />
          </button>
          <PillIcon size={24} color="var(--color-primary)" />
          <span style={st.titleText}>Medications</span>
        </div>
        <button onClick={() => setShowAddForm(true)} style={st.addBtn}>
          <PlusIcon size={16} color="#fff" />
          <span>Add</span>
        </button>
      </div>

      {/* Medication List */}
      {medications.length === 0 ? (
        <div style={st.emptyState}>
          <PillIcon size={48} color="var(--color-text-tertiary)" />
          <h3 style={st.emptyTitle}>No Medications</h3>
          <p style={st.emptyText}>
            Add your gout medications to track doses and get reminders.
          </p>
          <button onClick={() => setShowAddForm(true)} style={st.emptyButton}>
            <PlusIcon size={18} color="#fff" />
            Add Medication
          </button>
        </div>
      ) : (
        <div style={st.medList}>
          {medications.map((med) => {
            const interactions = getInteractions(med.name);
            return (
              <div key={med.id} style={st.medCard}>
                <div style={st.medHeader}>
                  <div>
                    <span style={st.medName}>{med.name}</span>
                    {med.dosage && (
                      <span style={st.medDosage}>{med.dosage}</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(med.id)} style={st.deleteBtn}>
                    <CloseIcon size={16} color="var(--color-text-tertiary)" />
                  </button>
                </div>

                {/* Dose Times */}
                <div style={st.doseList}>
                  {med.reminderTimes.map((time) => {
                    const taken = isDoseTaken(med.id, time);
                    return (
                      <button
                        key={time}
                        onClick={() => handleToggleDose(med.id, time)}
                        style={{
                          ...st.doseBtn,
                          background: taken ? 'var(--color-success)' : 'var(--color-surface)',
                          borderColor: taken ? 'var(--color-success)' : 'var(--color-border)',
                          color: taken ? '#fff' : 'var(--color-text)',
                        }}
                      >
                        {taken && <CheckIcon size={14} color="#fff" />}
                        <span>{formatTimeLabel(time)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Drug Interactions */}
                {interactions.length > 0 && (
                  <div style={st.warningBox}>
                    <AlertIcon size={14} color="var(--color-warning)" />
                    <div style={st.warningContent}>
                      {interactions.map((warning, i) => (
                        <p key={i} style={st.warningText}>{warning}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddForm && (
        <div style={st.overlay} onClick={() => setShowAddForm(false)}>
          <div style={st.modal} onClick={(e) => e.stopPropagation()}>
            <div style={st.modalTop}>
              <span style={st.modalTitle}>Add Medication</span>
              <button onClick={() => setShowAddForm(false)} style={st.closeBtn}>
                <CloseIcon size={20} color="var(--color-text-secondary)" />
              </button>
            </div>

            {/* Medication Name */}
            <label style={st.label}>Medication Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter medication name"
              style={st.input}
            />

            {/* Presets */}
            <button
              onClick={() => setShowPresets(!showPresets)}
              style={st.presetToggle}
            >
              {showPresets ? 'Hide' : 'Show'} common gout medications
            </button>
            {showPresets && (
              <div style={st.presetGrid}>
                {MEDICATION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setNewName(preset);
                      setShowPresets(false);
                    }}
                    style={{
                      ...st.presetChip,
                      background: newName === preset ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: newName === preset ? '#fff' : 'var(--color-text)',
                      borderColor: newName === preset ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}

            {/* Dosage */}
            <label style={{ ...st.label, marginTop: 16 }}>Dosage</label>
            <input
              type="text"
              value={newDosage}
              onChange={(e) => setNewDosage(e.target.value)}
              placeholder="e.g. 300mg, 0.6mg"
              style={st.input}
            />

            {/* Reminder Times */}
            <label style={{ ...st.label, marginTop: 16 }}>Reminder Times</label>
            {newTimes.map((time, i) => (
              <div key={i} style={st.timeRow}>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTimeSlot(i, e.target.value)}
                  style={{ ...st.input, flex: 1 }}
                />
                {newTimes.length > 1 && (
                  <button onClick={() => removeTimeSlot(i)} style={st.removeTimeBtn}>
                    <CloseIcon size={16} color="var(--color-danger)" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addTimeSlot} style={st.addTimeBtn}>
              <PlusIcon size={14} color="var(--color-primary)" />
              Add another time
            </button>

            <div style={st.modalActions}>
              <button onClick={() => setShowAddForm(false)} style={st.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleAddMedication} style={st.saveBtn}>
                Add Medication
              </button>
            </div>
          </div>
        </div>
      )}
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
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--color-primary)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Medication List
  medList: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  medCard: {
    padding: '16px',
    background: 'var(--color-surface)',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
  },
  medHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medName: {
    fontSize: 16,
    fontWeight: 700,
    display: 'block',
  },
  medDosage: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    display: 'block',
    marginTop: 2,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
  },
  doseList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  doseBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 10,
    border: '1.5px solid',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  warningBox: {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    padding: '10px 12px',
    background: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 10,
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    fontSize: 12,
    color: 'var(--color-warning)',
    lineHeight: 1.5,
    margin: 0,
    marginBottom: 2,
  },

  // Empty State
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 32px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 16,
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
    background: 'var(--color-primary)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
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
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  modalTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  presetToggle: {
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '8px 0',
    marginTop: 4,
  },
  presetGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  presetChip: {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  removeTimeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
  },
  addTimeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    color: 'var(--color-primary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 0',
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
    background: 'var(--color-primary)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
