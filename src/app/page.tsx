'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldIcon,
  ScanIcon,
  ChartIcon,
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
} from '@/lib/storage';
import { getToday, formatTime } from '@/lib/utils';
import type { DailyLog, UricAcidReading, WaterIntake, FoodEntry } from '@/lib/types';
import Link from 'next/link';

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

  useEffect(() => {
    // Gate: must complete onboarding first
    const profile = getUserProfile();
    if (!profile.onboardingComplete) {
      router.replace('/onboarding');
      return;
    }

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
    }

    setWater(getWaterIntake(today));
    setMounted(true);
  }, [router]);

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
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>G</span>
        </div>
      </div>

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
          <p style={{ fontSize: 13, color: 'var(--success)', marginTop: 8 }}>{statusText}</p>
        </div>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Quick Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {/* Uric Acid */}
          <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
            <DropletIcon size={20} color="var(--accent)" />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 8 }}>Uric Acid</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              {lastUA ? `${lastUA.value.toFixed(1)} mg/dL` : 'No readings'}
            </div>
          </div>
          {/* Since Flare */}
          <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
            <FlameIcon size={20} color="var(--orange)" />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 8 }}>Since Flare</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              {daysSinceFlare !== null ? `${daysSinceFlare} days` : 'No flares logged'}
            </div>
          </div>
          {/* Water */}
          <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
            <DropletIcon size={20} color="var(--cyan)" />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 8 }}>Water</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
              {waterTotal} / {waterGoal} oz
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ───────────────────────────────────────── */}
      <div className="section">
        <div className="section-label">Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Link href="/scanner" className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', background: 'var(--accent)', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>
            <ScanIcon size={28} color="#ffffff" />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Scan Food</span>
          </Link>
          <Link href="/uric-acid" className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', cursor: 'pointer', textDecoration: 'none' }}>
            <DropletIcon size={28} color="var(--accent)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Log Uric Acid</span>
          </Link>
          <Link href="/scanner" className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', cursor: 'pointer', textDecoration: 'none' }}>
            <FlameIcon size={28} color="var(--orange)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Log Flare</span>
          </Link>
          <Link href="/scanner" className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 12px', cursor: 'pointer', textDecoration: 'none' }}>
            <DropletIcon size={28} color="var(--cyan)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Log Water</span>
          </Link>
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
    </>
  );
}
