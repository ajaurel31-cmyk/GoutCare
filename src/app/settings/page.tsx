'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GoutStage, UserProfile } from '@/lib/types';
import { MEDICATION_PRESETS } from '@/lib/constants';
import { getUserProfile, updateUserProfile, exportAllData } from '@/lib/storage';
import { isSubscribed, getTrialDaysRemaining, restorePurchases } from '@/lib/subscription';
import { getSubscriptionStatus } from '@/lib/storage';
import { useTheme } from '@/hooks/useTheme';
import { SettingsIcon, CrownIcon, ShieldIcon } from '@/components/icons';

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    padding: '16px',
    paddingBottom: '120px',
    maxWidth: '600px',
    margin: '0 auto',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
  } as React.CSSProperties,

  title: {
    fontSize: '28px',
    fontWeight: '700',
  } as React.CSSProperties,

  card: {
    background: '#f9fafb',
    borderRadius: '14px',
    padding: '18px',
    marginBottom: '16px',
    border: '1px solid #e5e7eb',
  } as React.CSSProperties,

  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '16px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: '#6b7280',
  } as React.CSSProperties,

  fieldGroup: {
    marginBottom: '18px',
  } as React.CSSProperties,

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  } as React.CSSProperties,

  radioGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  radioLabelActive: {
    background: '#eff6ff',
    borderColor: '#1a56db',
    color: '#1a56db',
    fontWeight: '600',
  } as React.CSSProperties,

  radioInput: {
    display: 'none',
  } as React.CSSProperties,

  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  } as React.CSSProperties,

  chip: {
    padding: '6px 14px',
    borderRadius: '16px',
    border: '1px solid #d1d5db',
    fontSize: '13px',
    cursor: 'pointer',
    background: 'transparent',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  chipActive: {
    background: '#1a56db',
    color: '#ffffff',
    borderColor: '#1a56db',
  } as React.CSSProperties,

  tagInputRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
  } as React.CSSProperties,

  tagInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
  } as React.CSSProperties,

  tagAddBtn: {
    padding: '8px 16px',
    borderRadius: '10px',
    background: '#1a56db',
    color: '#ffffff',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  } as React.CSSProperties,

  tagList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  } as React.CSSProperties,

  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '12px',
    background: '#e5e7eb',
    fontSize: '13px',
  } as React.CSSProperties,

  tagRemove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    color: '#6b7280',
    padding: '0 2px',
  } as React.CSSProperties,

  rangeRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  } as React.CSSProperties,

  rangeValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a56db',
  } as React.CSSProperties,

  rangeInput: {
    width: '100%',
    accentColor: '#1a56db',
    height: '6px',
  } as React.CSSProperties,

  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#9ca3af',
  } as React.CSSProperties,

  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  } as React.CSSProperties,

  toggleLabel: {
    fontSize: '15px',
    fontWeight: '500',
  } as React.CSSProperties,

  toggleSwitch: {
    position: 'relative' as const,
    width: '48px',
    height: '28px',
    borderRadius: '14px',
    background: '#d1d5db',
    cursor: 'pointer',
    transition: 'background 0.2s',
    border: 'none',
    padding: 0,
  } as React.CSSProperties,

  toggleSwitchActive: {
    background: '#1a56db',
  } as React.CSSProperties,

  toggleKnob: {
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    background: '#ffffff',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  } as React.CSSProperties,

  toggleKnobActive: {
    transform: 'translateX(20px)',
  } as React.CSSProperties,

  subscriptionBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '12px',
  } as React.CSSProperties,

  btnRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  btn: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center' as const,
    textDecoration: 'none',
    transition: 'all 0.2s',
    display: 'block',
  } as React.CSSProperties,

  btnPrimary: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#ffffff',
    border: 'none',
  } as React.CSSProperties,

  btnDanger: {
    background: '#ffffff',
    color: '#dc2626',
    borderColor: '#dc2626',
  } as React.CSSProperties,

  link: {
    display: 'block',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '15px',
    color: '#1a56db',
    textDecoration: 'none',
  } as React.CSSProperties,

  versionText: {
    fontSize: '13px',
    color: '#9ca3af',
    marginTop: '8px',
  } as React.CSSProperties,

  disclaimer: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '8px',
  } as React.CSSProperties,

  disclaimerTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: '6px',
  } as React.CSSProperties,

  disclaimerText: {
    fontSize: '13px',
    color: '#991b1b',
    lineHeight: '1.6',
  } as React.CSSProperties,

  // Confirmation modal
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  } as React.CSSProperties,

  modal: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    maxWidth: '360px',
    width: '100%',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '10px',
  } as React.CSSProperties,

  modalText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '20px',
  } as React.CSSProperties,

  modalBtnRow: {
    display: 'flex',
    gap: '10px',
  } as React.CSSProperties,

  modalBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  } as React.CSSProperties,

  modalBtnDanger: {
    background: '#dc2626',
    color: '#ffffff',
    border: 'none',
  } as React.CSSProperties,
};

// ─── Toggle Component ───────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      style={{
        ...s.toggleSwitch,
        ...(checked ? s.toggleSwitchActive : {}),
      }}
      onClick={() => onChange(!checked)}
    >
      <span
        style={{
          ...s.toggleKnob,
          ...(checked ? s.toggleKnobActive : {}),
        }}
      />
    </button>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newRestriction, setNewRestriction] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Load profile on mount
  useEffect(() => {
    setProfile(getUserProfile());
  }, []);

  const save = useCallback(
    (updates: Partial<UserProfile>) => {
      const updated = updateUserProfile(updates);
      setProfile({ ...updated });
    },
    [],
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleStageChange = (stage: GoutStage) => {
    save({ goutStage: stage });
  };

  const handleMedicationToggle = (med: string) => {
    if (!profile) return;
    const meds = profile.medications.includes(med)
      ? profile.medications.filter((m) => m !== med)
      : [...profile.medications, med];
    save({ medications: meds });
  };

  const handleAddRestriction = () => {
    if (!profile) return;
    const tag = newRestriction.trim();
    if (!tag || profile.restrictions.includes(tag)) return;
    save({ restrictions: [...profile.restrictions, tag] });
    setNewRestriction('');
  };

  const handleRemoveRestriction = (tag: string) => {
    if (!profile) return;
    save({ restrictions: profile.restrictions.filter((r) => r !== tag) });
  };

  const handleRestrictionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRestriction();
    }
  };

  const handlePurineTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
    save({ purineTarget: parseInt(e.target.value, 10) });
  };

  const handleWaterGoal = (e: React.ChangeEvent<HTMLInputElement>) => {
    save({ waterGoal: parseInt(e.target.value, 10) });
  };

  const handleNotificationsToggle = (val: boolean) => {
    save({ notificationsEnabled: val });
  };

  const handleDarkModeToggle = () => {
    toggleTheme();
    // The theme hook handles persistence; re-read the profile to stay in sync
    setTimeout(() => {
      setProfile(getUserProfile());
    }, 50);
  };

  const handleExportJSON = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goutcare-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    alert('PDF report generation coming soon. This feature is under development.');
  };

  const handleClearData = () => {
    // Remove all goutcare keys from localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('goutcare_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Reset profile state
    setProfile(getUserProfile());
    setShowClearModal(false);
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        alert('Purchases restored successfully!');
      } else {
        alert('No active subscriptions found to restore.');
      }
    } catch {
      alert('Failed to restore purchases. Please try again.');
    }
    setRestoring(false);
  };

  // ── Subscription info ─────────────────────────────────────────────────

  const subscriptionStatus = getSubscriptionStatus();
  const premium = isSubscribed();
  const trialDays = getTrialDaysRemaining();

  function getSubscriptionLabel(): string {
    if (subscriptionStatus.plan === 'trial') {
      return `Free Trial \u2014 ${trialDays} day${trialDays !== 1 ? 's' : ''} left`;
    }
    if (subscriptionStatus.plan === 'monthly') return 'Monthly Premium';
    if (subscriptionStatus.plan === 'annual') return 'Annual Premium';
    return 'Free Plan';
  }

  function getSubscriptionBadgeStyle(): React.CSSProperties {
    if (subscriptionStatus.plan === 'free') {
      return { background: '#f3f4f6', color: '#6b7280' };
    }
    if (subscriptionStatus.plan === 'trial') {
      return { background: '#fef3c7', color: '#92400e' };
    }
    return { background: '#dcfce7', color: '#166534' };
  }

  // ── Loading state ─────────────────────────────────────────────────────

  if (!profile) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          Loading...
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <SettingsIcon size={28} />
        <h1 style={s.title}>Settings</h1>
      </div>

      {/* ── Profile Section ──────────────────────────────────────────────── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Profile</h2>

        {/* Gout Stage */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Gout Stage</label>
          <div style={s.radioGroup}>
            {(['acute', 'intercritical', 'chronic'] as GoutStage[]).map(
              (stage) => (
                <label
                  key={stage}
                  style={{
                    ...s.radioLabel,
                    ...(profile.goutStage === stage ? s.radioLabelActive : {}),
                  }}
                >
                  <input
                    type="radio"
                    name="goutStage"
                    value={stage}
                    checked={profile.goutStage === stage}
                    onChange={() => handleStageChange(stage)}
                    style={s.radioInput}
                  />
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </label>
              ),
            )}
          </div>
        </div>

        {/* Current Medications */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Current Medications</label>
          <div style={s.chipContainer}>
            {MEDICATION_PRESETS.map((med) => {
              const active = profile.medications.includes(med);
              return (
                <button
                  key={med}
                  style={{
                    ...s.chip,
                    ...(active ? s.chipActive : {}),
                  }}
                  onClick={() => handleMedicationToggle(med)}
                >
                  {med}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div style={{ ...s.fieldGroup, marginBottom: 0 }}>
          <label style={s.label}>Dietary Restrictions</label>
          <div style={s.tagInputRow}>
            <input
              type="text"
              value={newRestriction}
              onChange={(e) => setNewRestriction(e.target.value)}
              onKeyDown={handleRestrictionKeyDown}
              placeholder="Add restriction..."
              style={s.tagInput}
            />
            <button style={s.tagAddBtn} onClick={handleAddRestriction}>
              Add
            </button>
          </div>
          <div style={s.tagList}>
            {profile.restrictions.map((tag) => (
              <span key={tag} style={s.tag}>
                {tag}
                <button
                  style={s.tagRemove}
                  onClick={() => handleRemoveRestriction(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  x
                </button>
              </span>
            ))}
            {profile.restrictions.length === 0 && (
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                No restrictions added
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Goals Section ────────────────────────────────────────────────── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Goals</h2>

        {/* Daily Purine Target */}
        <div style={s.fieldGroup}>
          <label style={s.label}>Daily Purine Target</label>
          <div style={s.rangeRow}>
            <span style={s.rangeValue}>{profile.purineTarget}mg</span>
            <input
              type="range"
              min={200}
              max={600}
              step={10}
              value={profile.purineTarget}
              onChange={handlePurineTarget}
              style={s.rangeInput}
            />
            <div style={s.rangeLabels}>
              <span>200mg</span>
              <span>400mg</span>
              <span>600mg</span>
            </div>
          </div>
        </div>

        {/* Water Intake Goal */}
        <div style={{ ...s.fieldGroup, marginBottom: 0 }}>
          <label style={s.label}>Water Intake Goal</label>
          <div style={s.rangeRow}>
            <span style={s.rangeValue}>{profile.waterGoal}oz</span>
            <input
              type="range"
              min={32}
              max={128}
              step={4}
              value={profile.waterGoal}
              onChange={handleWaterGoal}
              style={s.rangeInput}
            />
            <div style={s.rangeLabels}>
              <span>32oz</span>
              <span>80oz</span>
              <span>128oz</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── App Section ──────────────────────────────────────────────────── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>App</h2>

        <div style={s.toggleRow}>
          <span style={s.toggleLabel}>Dark Mode</span>
          <Toggle checked={isDark} onChange={handleDarkModeToggle} />
        </div>

        <div style={{ ...s.toggleRow, borderBottom: 'none' }}>
          <span style={s.toggleLabel}>Notifications</span>
          <Toggle
            checked={profile.notificationsEnabled}
            onChange={handleNotificationsToggle}
          />
        </div>
      </div>

      {/* ── Subscription Section ─────────────────────────────────────────── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Subscription</h2>

        <span
          style={{ ...s.subscriptionBadge, ...getSubscriptionBadgeStyle() }}
        >
          {getSubscriptionLabel()}
        </span>

        <div style={s.btnRow}>
          {!premium && (
            <Link href="/premium" style={{ ...s.btn, ...s.btnPrimary }}>
              Upgrade to Premium
            </Link>
          )}
          <button
            style={s.btn}
            onClick={handleRestorePurchases}
            disabled={restoring}
          >
            {restoring ? 'Restoring...' : 'Restore Purchases'}
          </button>
        </div>
      </div>

      {/* ── Data Section ─────────────────────────────────────────────────── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Data</h2>

        <div style={{ ...s.btnRow, marginBottom: '10px' }}>
          <button style={s.btn} onClick={handleExportJSON}>
            Export Data (JSON)
          </button>
          <button
            style={{
              ...s.btn,
              ...(premium ? {} : { opacity: 0.5, cursor: 'not-allowed' }),
            }}
            onClick={premium ? handleExportPDF : undefined}
            disabled={!premium}
            title={premium ? 'Export PDF report' : 'Premium feature'}
          >
            Export PDF Report
            {!premium && ' (Premium)'}
          </button>
        </div>

        <button
          style={{ ...s.btn, ...s.btnDanger, width: '100%' }}
          onClick={() => setShowClearModal(true)}
        >
          Clear All Data
        </button>
      </div>

      {/* ── About Section ────────────────────────────────────────────────── */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>About</h2>

        <Link href="/terms" style={s.link}>
          Terms of Service
        </Link>
        <Link href="/privacy" style={s.link}>
          Privacy Policy
        </Link>
        <Link href="/disclaimer" style={{ ...s.link, borderBottom: 'none' }}>
          Medical Disclaimer
        </Link>

        <p style={s.versionText}>GoutCare v1.0.0</p>
      </div>

      {/* ── Medical Disclaimer ───────────────────────────────────────────── */}
      <div style={s.disclaimer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <ShieldIcon size={16} color="#dc2626" />
          <span style={s.disclaimerTitle}>Medical Disclaimer</span>
        </div>
        <p style={s.disclaimerText}>
          GoutCare is not a substitute for professional medical advice, diagnosis,
          or treatment. Always consult your rheumatologist or healthcare provider
          before making changes to your diet or medications.
        </p>
      </div>

      {/* ── Clear Data Confirmation Modal ────────────────────────────────── */}
      {showClearModal && (
        <div style={s.overlay} onClick={() => setShowClearModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Clear All Data?</h3>
            <p style={s.modalText}>
              This will permanently delete all your GoutCare data including food
              logs, uric acid readings, flare history, and settings. This action
              cannot be undone.
            </p>
            <div style={s.modalBtnRow}>
              <button
                style={s.modalBtn}
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...s.modalBtn, ...s.modalBtnDanger }}
                onClick={handleClearData}
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
