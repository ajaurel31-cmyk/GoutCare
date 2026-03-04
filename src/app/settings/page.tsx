'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PillIcon,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  ChevronIcon,
  AlertIcon,
  CrownIcon,
  BellIcon,
  DropletIcon,
  ForkKnifeIcon,
} from '@/components/icons';
import {
  getUserProfile,
  updateUserProfile,
  exportAllData,
  getMedications,
  addMedication,
  deleteMedication,
  getReminderSettings,
  updateReminderSettings,
} from '@/lib/storage';
import {
  requestPermission,
  scheduleAllReminders,
  cancelAllReminders,
} from '@/lib/notifications';
import { isSubscribed, isTrialActive, getTrialDaysRemaining } from '@/lib/subscription';
import { useTheme } from '@/hooks/useTheme';
import {
  DEFAULT_PURINE_TARGET,
  DEFAULT_WATER_GOAL,
  MEDICATION_PRESETS,
  DRUG_INTERACTIONS,
  STAGE_DEFAULTS,
} from '@/lib/constants';
import type { UserProfile, GoutStage, Medication, ReminderSettings } from '@/lib/types';
import Link from 'next/link';

type ModalType = 'medication' | null;

const GOUT_STAGES: { value: GoutStage; label: string; desc: string }[] = [
  { value: 'acute', label: 'Acute', desc: 'Currently experiencing or recently had a flare — stricter limits recommended' },
  { value: 'intercritical', label: 'Intercritical', desc: 'Between flares, managing to prevent next one' },
  { value: 'chronic', label: 'Chronic', desc: 'Long-term gout with frequent flares — tighter management recommended' },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<ReminderSettings | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const refresh = useCallback(() => {
    setProfile(getUserProfile());
    setMeds(getMedications());
    setReminders(getReminderSettings());
  }, []);

  useEffect(() => {
    refresh();
    setMounted(true);
  }, [refresh]);

  const updateReminder = async <K extends keyof ReminderSettings>(key: K, value: ReminderSettings[K]) => {
    const updated = updateReminderSettings({ [key]: value });
    setReminders(updated);

    // Check if any reminder is enabled
    const anyEnabled = updated.waterEnabled || updated.mealsEnabled || updated.medicationEnabled || updated.uricAcidEnabled;

    if (anyEnabled) {
      const granted = await requestPermission();
      if (!granted) {
        showToast('Please enable notifications in your device settings');
        // Revert the toggle
        const reverted = updateReminderSettings({ [key]: false });
        setReminders(reverted);
        return;
      }
      await scheduleAllReminders();
    } else {
      await cancelAllReminders();
    }
  };

  const addMedicationTime = () => {
    if (!reminders) return;
    const times = [...reminders.medicationTimes, '09:00'];
    updateReminder('medicationTimes', times);
  };

  const updateMedicationTime = (index: number, value: string) => {
    if (!reminders) return;
    const times = [...reminders.medicationTimes];
    times[index] = value;
    updateReminder('medicationTimes', times);
  };

  const removeMedicationTime = (index: number) => {
    if (!reminders) return;
    const times = reminders.medicationTimes.filter((_, i) => i !== index);
    updateReminder('medicationTimes', times.length > 0 ? times : ['09:00']);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const updateField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    updateUserProfile({ [key]: value });
    refresh();
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goutcare-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported');
  };

  const handleClearData = async () => {
    if (confirm('Are you sure? This will delete ALL your data and cannot be undone.')) {
      if (typeof window !== 'undefined') {
        await cancelAllReminders();
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('goutcare_')) keys.push(key);
        }
        keys.forEach((k) => localStorage.removeItem(k));
        showToast('All data cleared');
        window.location.href = '/';
      }
    }
  };

  const handleDeleteMed = (id: string) => {
    deleteMedication(id);
    refresh();
    showToast('Medication removed');
  };

  if (!mounted || !profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const sub = isSubscribed();
  const trial = isTrialActive();
  const trialDays = getTrialDaysRemaining();

  return (
    <div style={{ paddingTop: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 20 }}>Settings</h1>

      {/* ── Subscription Status ─────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Subscription</div>
        <Link href="/paywall" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: sub ? 'var(--success-light)' : trial ? 'var(--accent-light)' : 'var(--danger-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CrownIcon size={20} color={sub ? 'var(--success)' : trial ? 'var(--accent)' : 'var(--danger)'} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {sub ? 'Premium' : trial ? 'Free Trial' : 'Free Plan'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {sub ? 'Full access to all features' : trial ? `${trialDays} day${trialDays !== 1 ? 's' : ''} remaining` : 'Trial expired'}
                </div>
              </div>
            </div>
            <ChevronIcon size={18} color="var(--text-tertiary)" />
          </div>
        </Link>
      </div>

      {/* ── Appearance ──────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Appearance</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {(['dark', 'light', 'system'] as const).map((t, i) => (
            <button
              key={t}
              onClick={() => { setTheme(t); updateField('theme', t); showToast(`Theme: ${t}`); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '14px 16px', cursor: 'pointer',
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                  background: t === 'dark' ? '#1a1a2e' : t === 'light' ? '#f0f2f5' : 'linear-gradient(135deg, #1a1a2e 50%, #f0f2f5 50%)',
                  border: '1.5px solid var(--border-strong)',
                }} />
                <span style={{ fontSize: 15, fontWeight: 500, textTransform: 'capitalize' }}>{t}</span>
              </div>
              {theme === t && <CheckIcon size={18} color="var(--accent)" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Daily Goals ─────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Daily Goals</div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Purine Target */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>Purine Limit</label>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{profile.purineTarget} mg/day</span>
            </div>
            <input
              type="range"
              min="200"
              max="600"
              step="25"
              value={profile.purineTarget}
              onChange={(e) => updateField('purineTarget', Number(e.target.value))}
              aria-label="Purine limit"
              style={{
                width: '100%', height: 6, borderRadius: 'var(--radius-full)',
                appearance: 'none', WebkitAppearance: 'none',
                background: 'var(--border-strong)', outline: 'none', cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>200 mg</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Stage default: {STAGE_DEFAULTS[profile.goutStage]?.purineTarget ?? DEFAULT_PURINE_TARGET}</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>600 mg</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)' }} />

          {/* Water Goal */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>Water Goal</label>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--cyan)' }}>{profile.waterGoal} oz/day</span>
            </div>
            <input
              type="range"
              min="32"
              max="128"
              step="8"
              value={profile.waterGoal}
              onChange={(e) => updateField('waterGoal', Number(e.target.value))}
              aria-label="Water goal"
              style={{
                width: '100%', height: 6, borderRadius: 'var(--radius-full)',
                appearance: 'none', WebkitAppearance: 'none',
                background: 'var(--border-strong)', outline: 'none', cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>32 oz</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Stage default: {STAGE_DEFAULTS[profile.goutStage]?.waterGoal ?? DEFAULT_WATER_GOAL}</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>128 oz</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reminders ──────────────────────────────────────────── */}
      {reminders && (
        <div className="section">
          <div className="section-label">Reminders</div>

          {/* Water Reminders */}
          <div className="card" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: reminders.waterEnabled ? 14 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'var(--cyan-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <DropletIcon size={18} color="var(--cyan)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Water Reminders</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Stay hydrated throughout the day</div>
                </div>
              </div>
              <button
                className={`toggle ${reminders.waterEnabled ? 'toggle-active' : ''}`}
                onClick={() => updateReminder('waterEnabled', !reminders.waterEnabled)}
                role="switch"
                aria-checked={reminders.waterEnabled}
                aria-label="Water reminders"
              />
            </div>
            {reminders.waterEnabled && (
              <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Every</label>
                  <select
                    className="reminder-select"
                    value={reminders.waterIntervalHours}
                    onChange={(e) => updateReminder('waterIntervalHours', Number(e.target.value))}
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>From</label>
                  <input
                    type="time"
                    className="reminder-time"
                    value={reminders.waterStartTime}
                    onChange={(e) => updateReminder('waterStartTime', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Until</label>
                  <input
                    type="time"
                    className="reminder-time"
                    value={reminders.waterEndTime}
                    onChange={(e) => updateReminder('waterEndTime', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Meal / Purine Reminders */}
          <div className="card" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: reminders.mealsEnabled ? 14 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <ForkKnifeIcon size={18} color="var(--warning)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Meal Log Reminders</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Log purine intake at mealtimes</div>
                </div>
              </div>
              <button
                className={`toggle ${reminders.mealsEnabled ? 'toggle-active' : ''}`}
                onClick={() => updateReminder('mealsEnabled', !reminders.mealsEnabled)}
                role="switch"
                aria-checked={reminders.mealsEnabled}
                aria-label="Meal reminders"
              />
            </div>
            {reminders.mealsEnabled && (
              <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Breakfast</label>
                  <input
                    type="time"
                    className="reminder-time"
                    value={reminders.breakfastTime}
                    onChange={(e) => updateReminder('breakfastTime', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Lunch</label>
                  <input
                    type="time"
                    className="reminder-time"
                    value={reminders.lunchTime}
                    onChange={(e) => updateReminder('lunchTime', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Dinner</label>
                  <input
                    type="time"
                    className="reminder-time"
                    value={reminders.dinnerTime}
                    onChange={(e) => updateReminder('dinnerTime', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Medication Reminders */}
          <div className="card" style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: reminders.medicationEnabled ? 14 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <PillIcon size={18} color="var(--purple)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Medication Reminders</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Never miss a dose</div>
                </div>
              </div>
              <button
                className={`toggle ${reminders.medicationEnabled ? 'toggle-active' : ''}`}
                onClick={() => updateReminder('medicationEnabled', !reminders.medicationEnabled)}
                role="switch"
                aria-checked={reminders.medicationEnabled}
                aria-label="Medication reminders"
              />
            </div>
            {reminders.medicationEnabled && (
              <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reminders.medicationTimes.map((time, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Dose {i + 1}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="time"
                        className="reminder-time"
                        value={time}
                        onChange={(e) => updateMedicationTime(i, e.target.value)}
                      />
                      {reminders.medicationTimes.length > 1 && (
                        <button onClick={() => removeMedicationTime(i)} aria-label={`Remove dose ${i + 1}`} style={{ padding: 4, opacity: 0.5 }}>
                          <CloseIcon size={14} color="var(--text-tertiary)" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {reminders.medicationTimes.length < 6 && (
                  <button
                    onClick={addMedicationTime}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
                      color: 'var(--accent)', padding: '6px 0',
                    }}
                  >
                    <PlusIcon size={14} color="var(--accent)" />
                    Add another time
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Uric Acid Reminder */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: reminders.uricAcidEnabled ? 14 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <BellIcon size={18} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Uric Acid Check</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Periodic testing reminders</div>
                </div>
              </div>
              <button
                className={`toggle ${reminders.uricAcidEnabled ? 'toggle-active' : ''}`}
                onClick={() => updateReminder('uricAcidEnabled', !reminders.uricAcidEnabled)}
                role="switch"
                aria-checked={reminders.uricAcidEnabled}
                aria-label="Uric acid check reminders"
              />
            </div>
            {reminders.uricAcidEnabled && (
              <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Frequency</label>
                  <select
                    className="reminder-select"
                    value={reminders.uricAcidFrequency}
                    onChange={(e) => updateReminder('uricAcidFrequency', e.target.value as 'weekly' | 'monthly')}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {reminders.uricAcidFrequency === 'weekly' ? 'Day' : 'Day of month'}
                  </label>
                  {reminders.uricAcidFrequency === 'weekly' ? (
                    <select
                      className="reminder-select"
                      value={reminders.uricAcidDay}
                      onChange={(e) => updateReminder('uricAcidDay', Number(e.target.value))}
                    >
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                        <option key={d} value={i}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      className="reminder-select"
                      value={reminders.uricAcidDay}
                      onChange={(e) => updateReminder('uricAcidDay', Number(e.target.value))}
                    >
                      {Array.from({ length: 28 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Time</label>
                  <input
                    type="time"
                    className="reminder-time"
                    value={reminders.uricAcidTime}
                    onChange={(e) => updateReminder('uricAcidTime', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Gout Stage ──────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Gout Stage</div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {GOUT_STAGES.map((s, i) => {
            const defaults = STAGE_DEFAULTS[s.value];
            return (
              <button
                key={s.value}
                onClick={() => {
                  const stageDefaults = STAGE_DEFAULTS[s.value];
                  updateUserProfile({
                    goutStage: s.value,
                    purineTarget: stageDefaults.purineTarget,
                    waterGoal: stageDefaults.waterGoal,
                  });
                  refresh();
                  showToast(`${s.label} — ${stageDefaults.purineTarget}mg purine, ${stageDefaults.waterGoal}oz water`);
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '14px 16px', cursor: 'pointer',
                  borderBottom: i < GOUT_STAGES.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, textAlign: 'left' }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'left', marginTop: 2 }}>{s.desc}</div>
                  {profile.goutStage !== s.value && defaults && (
                    <div style={{ fontSize: 11, color: 'var(--accent)', textAlign: 'left', marginTop: 3 }}>
                      Recommended: {defaults.purineTarget}mg purine, {defaults.waterGoal}oz water
                    </div>
                  )}
                </div>
                {profile.goutStage === s.value && <CheckIcon size={18} color="var(--accent)" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Medications ─────────────────────────────────────────── */}
      <div className="section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="section-label" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>Medications</div>
          <button
            onClick={() => setActiveModal('medication')}
            className="btn btn-sm btn-secondary"
          >
            <PlusIcon size={14} color="var(--accent)" />
            Add
          </button>
        </div>

        {meds.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <PillIcon size={24} color="var(--text-tertiary)" />
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8 }}>No medications added</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {meds.map((med) => {
              const interactions = DRUG_INTERACTIONS[med.name];
              return (
                <div key={med.id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{med.name}</div>
                      {med.dosage && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{med.dosage}</div>}
                    </div>
                    <button onClick={() => handleDeleteMed(med.id)} aria-label={`Remove ${med.name}`} style={{ padding: 4, opacity: 0.4 }}>
                      <CloseIcon size={14} color="var(--text-tertiary)" />
                    </button>
                  </div>
                  {interactions && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                      {interactions.map((w, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                          <div style={{ flexShrink: 0, marginTop: 2 }}>
                            <AlertIcon size={12} color="var(--warning)" />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--warning)', lineHeight: 1.4 }}>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Data Management ─────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Data</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handleExport} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Export Data</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Download all your data as JSON</div>
            </div>
          </button>

          <button onClick={handleClearData} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)' }}>Clear All Data</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Delete everything — cannot be undone</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── About ───────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">About</div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="26" viewBox="0 0 20 24">
                <path d="M10 0 C10 0 0 12 0 16 C0 20.4 4.5 24 10 24 C15.5 24 20 20.4 20 16 C20 12 10 0 10 0Z" fill="#fff" />
                <path d="M12.2 17 L12.2 18.6 C11.5 19.2 10.6 19.6 9.6 19.6 C7.2 19.6 5.6 17.6 5.6 15.2 C5.6 12.8 7.2 10.8 9.6 10.8 C10.8 10.8 11.7 11.2 12.3 11.8 L11.3 13 C10.8 12.5 10.3 12.2 9.6 12.2 C8.1 12.2 7.2 13.4 7.2 15.2 C7.2 17 8.1 18.2 9.6 18.2 C10.2 18.2 10.7 18 11 17.6 L11 16.8 L9.8 16.8 L9.8 15.6 L12.2 15.6 Z" fill="#1e3a5f"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>GoutCare</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Version 1.0.0</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            AI-powered gout management. Track purines, scan foods, monitor uric acid, and manage flares. Unlimited AI food scans and PDF health reports require a subscription.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <Link href="/terms" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'underline' }}>Terms of Service</Link>
            <Link href="/privacy" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'underline' }}>Privacy Policy</Link>
            <Link href="/eula" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'underline' }}>EULA</Link>
          </div>
        </div>
      </div>

      {/* ── Add Medication Modal ────────────────────────────────── */}
      {activeModal === 'medication' && (
        <MedicationModal
          onClose={() => setActiveModal(null)}
          onSave={(name, dosage) => {
            addMedication({ name, dosage, reminderTimes: [], isActive: true });
            refresh();
            setActiveModal(null);
            showToast(`Added ${name}`);
          }}
        />
      )}

      {/* Toast */}
      {toast && <div className="toast toast-success" role="alert">{toast}</div>}
    </div>
  );
}

function MedicationModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, dosage: string) => void }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [showPresets, setShowPresets] = useState(true);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PillIcon size={22} color="var(--accent)" />
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add Medication</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ padding: 4 }}>
            <CloseIcon size={20} color="var(--text-tertiary)" />
          </button>
        </div>

        {/* Preset Buttons */}
        {showPresets && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              Common Medications
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {MEDICATION_PRESETS.map((med) => (
                <button
                  key={med}
                  onClick={() => { setName(med); setShowPresets(false); }}
                  style={{
                    padding: '8px 14px', borderRadius: 'var(--radius-full)',
                    fontSize: 13, fontWeight: 600,
                    background: name === med ? 'var(--accent)' : 'var(--bg-input)',
                    color: name === med ? '#fff' : 'var(--text-secondary)',
                    border: `1.5px solid ${name === med ? 'var(--accent)' : 'var(--border-strong)'}`,
                  }}
                >
                  {med}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Name Input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Medication Name
          </label>
          <input
            className="input"
            type="text"
            placeholder="e.g. Allopurinol"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Dosage Input */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Dosage (optional)
          </label>
          <input
            className="input"
            type="text"
            placeholder="e.g. 100mg daily"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>

        {/* Drug Interaction Warning */}
        {name && DRUG_INTERACTIONS[name] && (
          <div style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--warning-light)', border: '1px solid var(--warning)',
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)', marginBottom: 6 }}>Interactions</div>
            {DRUG_INTERACTIONS[name].map((w, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--warning)', lineHeight: 1.5, marginBottom: 2 }}>
                {w}
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-primary btn-full btn-lg"
          disabled={!name.trim()}
          onClick={() => onSave(name.trim(), dosage.trim())}
        >
          <CheckIcon size={18} color="#fff" />
          <span>Add Medication</span>
        </button>
      </div>
    </div>
  );
}
