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
      className={`toggle ${checked ? 'toggle-active' : ''}`}
      onClick={() => onChange(!checked)}
    />
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
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('goutcare_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
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

  function getSubscriptionBadgeClass(): string {
    if (subscriptionStatus.plan === 'free') return 'settings-sub-badge settings-sub-free';
    if (subscriptionStatus.plan === 'trial') return 'settings-sub-badge settings-sub-trial';
    return 'settings-sub-badge settings-sub-premium';
  }

  // ── Loading state ─────────────────────────────────────────────────────

  if (!profile) {
    return (
      <div className="settings-page flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="settings-page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <SettingsIcon size={28} />
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Settings</h1>
      </div>

      {/* ── Profile Section ──────────────────────────────────────────────── */}
      <div className="settings-card">
        <h2 className="settings-card-title">Profile</h2>

        {/* Gout Stage */}
        <div className="settings-field-group">
          <label className="settings-label">Gout Stage</label>
          <div className="settings-radio-group">
            {(['acute', 'intercritical', 'chronic'] as GoutStage[]).map(
              (stage) => (
                <label
                  key={stage}
                  className={`settings-radio-label ${profile.goutStage === stage ? 'settings-radio-active' : ''}`}
                >
                  <input
                    type="radio"
                    name="goutStage"
                    value={stage}
                    checked={profile.goutStage === stage}
                    onChange={() => handleStageChange(stage)}
                    style={{ display: 'none' }}
                  />
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </label>
              ),
            )}
          </div>
        </div>

        {/* Current Medications */}
        <div className="settings-field-group">
          <label className="settings-label">Current Medications</label>
          <div className="settings-chip-container">
            {MEDICATION_PRESETS.map((med) => {
              const active = profile.medications.includes(med);
              return (
                <button
                  key={med}
                  className={`settings-chip ${active ? 'settings-chip-active' : ''}`}
                  onClick={() => handleMedicationToggle(med)}
                >
                  {med}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="settings-field-group">
          <label className="settings-label">Dietary Restrictions</label>
          <div className="settings-tag-input-row">
            <input
              type="text"
              value={newRestriction}
              onChange={(e) => setNewRestriction(e.target.value)}
              onKeyDown={handleRestrictionKeyDown}
              placeholder="Add restriction..."
              className="settings-tag-input"
            />
            <button className="settings-tag-add-btn" onClick={handleAddRestriction}>
              Add
            </button>
          </div>
          <div className="settings-tag-list">
            {profile.restrictions.map((tag) => (
              <span key={tag} className="settings-tag">
                {tag}
                <button
                  className="settings-tag-remove"
                  onClick={() => handleRemoveRestriction(tag)}
                  aria-label={`Remove ${tag}`}
                >
                  &times;
                </button>
              </span>
            ))}
            {profile.restrictions.length === 0 && (
              <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                No restrictions added
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Goals Section ────────────────────────────────────────────────── */}
      <div className="settings-card">
        <h2 className="settings-card-title">Goals</h2>

        {/* Daily Purine Target */}
        <div className="settings-field-group">
          <label className="settings-label">Daily Purine Target</label>
          <div className="settings-range-row">
            <span className="settings-range-value">{profile.purineTarget}mg</span>
            <input
              type="range"
              min={200}
              max={600}
              step={10}
              value={profile.purineTarget}
              onChange={handlePurineTarget}
              className="settings-range-input"
            />
            <div className="settings-range-labels">
              <span>200mg</span>
              <span>400mg</span>
              <span>600mg</span>
            </div>
          </div>
        </div>

        {/* Water Intake Goal */}
        <div className="settings-field-group">
          <label className="settings-label">Water Intake Goal</label>
          <div className="settings-range-row">
            <span className="settings-range-value">{profile.waterGoal}oz</span>
            <input
              type="range"
              min={32}
              max={128}
              step={4}
              value={profile.waterGoal}
              onChange={handleWaterGoal}
              className="settings-range-input"
            />
            <div className="settings-range-labels">
              <span>32oz</span>
              <span>80oz</span>
              <span>128oz</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── App Section ──────────────────────────────────────────────────── */}
      <div className="settings-card">
        <h2 className="settings-card-title">App</h2>

        <div className="settings-toggle-row">
          <span className="settings-toggle-label">Dark Mode</span>
          <Toggle checked={isDark} onChange={handleDarkModeToggle} />
        </div>

        <div className="settings-toggle-row">
          <span className="settings-toggle-label">Notifications</span>
          <Toggle
            checked={profile.notificationsEnabled}
            onChange={handleNotificationsToggle}
          />
        </div>
      </div>

      {/* ── Subscription Section ─────────────────────────────────────────── */}
      <div className="settings-card">
        <h2 className="settings-card-title">Subscription</h2>

        <span className={getSubscriptionBadgeClass()}>
          {getSubscriptionLabel()}
        </span>

        <div className="settings-btn-row">
          {!premium && (
            <Link href="/premium" className="settings-btn settings-btn-primary">
              <CrownIcon size={16} color="#ffffff" /> Upgrade to Premium
            </Link>
          )}
          <button
            className="settings-btn"
            onClick={handleRestorePurchases}
            disabled={restoring}
          >
            {restoring ? 'Restoring...' : 'Restore Purchases'}
          </button>
        </div>
      </div>

      {/* ── Data Section ─────────────────────────────────────────────────── */}
      <div className="settings-card">
        <h2 className="settings-card-title">Data</h2>

        <div className="settings-btn-row" style={{ marginBottom: 10 }}>
          <button className="settings-btn" onClick={handleExportJSON}>
            Export Data (JSON)
          </button>
          <button
            className="settings-btn"
            onClick={premium ? handleExportPDF : undefined}
            disabled={!premium}
            title={premium ? 'Export PDF report' : 'Premium feature'}
            style={!premium ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            Export PDF Report
            {!premium && ' (Premium)'}
          </button>
        </div>

        <button
          className="settings-btn settings-btn-danger"
          style={{ width: '100%' }}
          onClick={() => setShowClearModal(true)}
        >
          Clear All Data
        </button>
      </div>

      {/* ── About Section ────────────────────────────────────────────────── */}
      <div className="settings-card">
        <h2 className="settings-card-title">About</h2>

        <Link href="/terms" className="settings-link">
          Terms of Service
        </Link>
        <Link href="/privacy" className="settings-link">
          Privacy Policy
        </Link>
        <Link href="/disclaimer" className="settings-link">
          Medical Disclaimer
        </Link>

        <p className="settings-version">GoutCare v1.0.0</p>
      </div>

      {/* ── Medical Disclaimer ───────────────────────────────────────────── */}
      <div className="settings-disclaimer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <ShieldIcon size={16} color="var(--color-danger)" />
          <span className="settings-disclaimer-title">Medical Disclaimer</span>
        </div>
        <p className="settings-disclaimer-text">
          GoutCare is not a substitute for professional medical advice, diagnosis,
          or treatment. Always consult your rheumatologist or healthcare provider
          before making changes to your diet or medications.
        </p>
      </div>

      {/* ── Clear Data Confirmation Modal ────────────────────────────────── */}
      {showClearModal && (
        <div className="settings-overlay" onClick={() => setShowClearModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="settings-modal-title">Clear All Data?</h3>
            <p className="settings-modal-text">
              This will permanently delete all your GoutCare data including food
              logs, uric acid readings, flare history, and settings. This action
              cannot be undone.
            </p>
            <div className="settings-modal-btn-row">
              <button
                className="settings-modal-btn"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
              <button
                className="settings-modal-btn settings-modal-btn-danger"
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
