'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FlameIcon,
  DropletIcon,
  ForkKnifeIcon,
} from '@/components/icons';
import {
  getDailyLog,
  getUricAcidReadings,
  getGoutFlares,
  getWaterIntake,
  getUserProfile,
  addWaterEntry,
  addUricAcidReading,
  addGoutFlare,
  addFoodEntry,
} from '@/lib/storage';
import { isTrialActive, isSubscribed } from '@/lib/subscription';
import { getTrialDaysRemaining } from '@/lib/subscription';
import { getToday, formatTime } from '@/lib/utils';
import type { DailyLog, UricAcidReading, WaterIntake, FoodEntry } from '@/lib/types';
import Link from 'next/link';

import WaterLogModal from '@/components/WaterLogModal';
import UricAcidLogModal from '@/components/UricAcidLogModal';
import FlareLogModal from '@/components/FlareLogModal';
import FoodLogModal from '@/components/FoodLogModal';

type ModalType = 'water' | 'uricAcid' | 'flare' | 'food' | null;

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getDateString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [lastUA, setLastUA] = useState<UricAcidReading | null>(null);
  const [daysSinceFlare, setDaysSinceFlare] = useState<number | null>(null);
  const [water, setWater] = useState<WaterIntake | null>(null);
  const [trialDays, setTrialDays] = useState<number>(0);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const refreshData = useCallback(() => {
    const today = getToday();
    setDailyLog(getDailyLog(today));

    const readings = getUricAcidReadings();
    setLastUA(readings.length > 0 ? readings[0] : null);

    const flares = getGoutFlares();
    if (flares.length > 0) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const fd = new Date(flares[0].date + 'T00:00:00');
      fd.setHours(0, 0, 0, 0);
      setDaysSinceFlare(Math.floor((now.getTime() - fd.getTime()) / 86400000));
    } else {
      setDaysSinceFlare(null);
    }

    setWater(getWaterIntake(today));
  }, []);

  useEffect(() => {
    const profile = getUserProfile();
    if (!profile.onboardingComplete) {
      router.replace('/onboarding');
      return;
    }

    if (!isTrialActive() && !isSubscribed()) {
      router.replace('/paywall');
      return;
    }

    setTrialDays(getTrialDaysRemaining());
    refreshData();
    setMounted(true);
  }, [router, refreshData]);

  // ── Modal Handlers ──────────────────────────────────────────────

  const handleWaterSave = (amount: number) => {
    addWaterEntry(getToday(), amount);
    setActiveModal(null);
    refreshData();
    showToast(`Added ${amount} oz of water`);
  };

  const handleUricAcidSave = (reading: { date: string; value: number; notes: string }) => {
    addUricAcidReading(reading);
    setActiveModal(null);
    refreshData();
    showToast(`Logged ${reading.value} mg/dL`);
  };

  const handleFlareSave = (flare: Parameters<typeof addGoutFlare>[0]) => {
    addGoutFlare(flare);
    setActiveModal(null);
    refreshData();
    showToast('Flare logged');
  };

  const handleFoodSave = (food: { foodId: string; name: string; servingSize: string; purineContent: number }) => {
    addFoodEntry(getToday(), food);
    setActiveModal(null);
    refreshData();
    showToast(`Added ${food.name} (${food.purineContent} mg)`);
  };

  // ── Loading ─────────────────────────────────────────────────────

  if (!mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const target = getUserProfile().purineTarget || 400;
  const current = dailyLog?.totalPurine || 0;
  const pct = Math.min((current / target) * 100, 100);
  const waterGoal = getUserProfile().waterGoal || 64;
  const waterTotal = water?.total || 0;

  let barColor = 'var(--success)';
  if (pct > 80) barColor = 'var(--danger)';
  else if (pct >= 50) barColor = 'var(--warning)';

  let statusText = 'On track — keep it up!';
  if (pct > 80) statusText = 'Over limit — be careful';
  else if (pct >= 50) statusText = 'Getting close to your limit';

  const foods = dailyLog?.foods || [];

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>{getGreeting()}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{getDateString()}</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <svg width="24" height="28" viewBox="0 0 20 24">
            <path d="M10 0 C10 0 0 12 0 16 C0 20.4 4.5 24 10 24 C15.5 24 20 20.4 20 16 C20 12 10 0 10 0Z" fill="#fff" />
            <path d="M12.2 17 L12.2 18.6 C11.5 19.2 10.6 19.6 9.6 19.6 C7.2 19.6 5.6 17.6 5.6 15.2 C5.6 12.8 7.2 10.8 9.6 10.8 C10.8 10.8 11.7 11.2 12.3 11.8 L11.3 13 C10.8 12.5 10.3 12.2 9.6 12.2 C8.1 12.2 7.2 13.4 7.2 15.2 C7.2 17 8.1 18.2 9.6 18.2 C10.2 18.2 10.7 18 11 17.6 L11 16.8 L9.8 16.8 L9.8 15.6 L12.2 15.6 Z" fill="#1e3a5f"/>
          </svg>
        </div>
      </div>

      {/* ── Trial Banner ─────────────────────────────────────────── */}
      {trialDays > 0 && trialDays <= 7 && (
        <Link href="/paywall" style={{ textDecoration: 'none', display: 'block', marginBottom: 16 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 14,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                {trialDays === 1 ? 'Last day of free trial!' : `${trialDays} days left in free trial`}
              </span>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>Tap to view plans</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap' }}>Upgrade &rarr;</span>
          </div>
        </Link>
      )}

      {/* ── Daily Purine Intake ─────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Daily Purine Intake</div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' }}>
              {current} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)' }}>/ {target} mg</span>
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: barColor }}>{Math.round(pct)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
          </div>
          <p style={{ fontSize: 13, color: barColor, marginTop: 8 }}>{statusText}</p>
        </div>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Quick Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <button className="card" onClick={() => setActiveModal('uricAcid')} style={{ textAlign: 'center', padding: '14px 8px', cursor: 'pointer' }}>
            <DropletIcon size={20} color="var(--accent)" />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 8 }}>Uric Acid</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              {lastUA ? `${lastUA.value.toFixed(1)} mg/dL` : 'No readings'}
            </div>
          </button>
          <button className="card" onClick={() => setActiveModal('flare')} style={{ textAlign: 'center', padding: '14px 8px', cursor: 'pointer' }}>
            <FlameIcon size={20} color="var(--orange)" />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 8 }}>Since Flare</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              {daysSinceFlare !== null ? `${daysSinceFlare} days` : 'No flares logged'}
            </div>
          </button>
          <button className="card" onClick={() => setActiveModal('water')} style={{ textAlign: 'center', padding: '14px 8px', cursor: 'pointer' }}>
            <DropletIcon size={20} color="var(--cyan)" />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 8 }}>Water</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              {waterTotal} / {waterGoal} oz
            </div>
          </button>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => setActiveModal('food')} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', background: 'var(--accent)', border: 'none', cursor: 'pointer' }}>
            <ForkKnifeIcon size={28} color="#ffffff" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Add Food</span>
          </button>
          <button onClick={() => setActiveModal('uricAcid')} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', cursor: 'pointer' }}>
            <DropletIcon size={28} color="var(--accent)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Log Uric Acid</span>
          </button>
          <button onClick={() => setActiveModal('flare')} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', cursor: 'pointer' }}>
            <FlameIcon size={28} color="var(--orange)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Log Flare</span>
          </button>
          <button onClick={() => setActiveModal('water')} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', cursor: 'pointer' }}>
            <DropletIcon size={28} color="var(--cyan)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Log Water</span>
          </button>
        </div>
      </div>

      {/* ── Today's Foods ───────────────────────────────────────── */}
      {foods.length > 0 && (
        <div className="section">
          <div className="section-label">Today&apos;s Foods</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {foods.map((f: FoodEntry) => (
              <div key={f.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{formatTime(f.timestamp)}</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: f.purineContent > 200 ? 'var(--danger)' : f.purineContent > 100 ? 'var(--warning)' : 'var(--success)' }}>
                  {f.purineContent} mg
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────── */}
      {activeModal === 'water' && (
        <WaterLogModal onClose={() => setActiveModal(null)} onSave={handleWaterSave} />
      )}
      {activeModal === 'uricAcid' && (
        <UricAcidLogModal onClose={() => setActiveModal(null)} onSave={handleUricAcidSave} />
      )}
      {activeModal === 'flare' && (
        <FlareLogModal onClose={() => setActiveModal(null)} onSave={handleFlareSave} />
      )}
      {activeModal === 'food' && (
        <FoodLogModal onClose={() => setActiveModal(null)} onSave={handleFoodSave} />
      )}

      {/* ── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
