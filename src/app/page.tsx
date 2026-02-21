'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from '@/lib/storage';
import { getToday, formatTime, getUricAcidColor } from '@/lib/utils';
import type { DailyLog, UricAcidReading, GoutFlare, WaterIntake, FoodEntry } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [lastUricAcid, setLastUricAcid] = useState<UricAcidReading | null>(null);
  const [daysSinceFlare, setDaysSinceFlare] = useState<number | null>(null);
  const [waterIntake, setWaterIntake] = useState<WaterIntake | null>(null);

  useEffect(() => {
    // Check onboarding
    try {
      const profileRaw = localStorage.getItem('goutcare_profile');
      if (profileRaw) {
        const profile = JSON.parse(profileRaw);
        if (!profile.onboardingComplete) {
          router.push('/onboarding');
          return;
        }
      } else {
        // Also check the storage module key
        const profileAlt = localStorage.getItem('goutcare_user_profile');
        if (profileAlt) {
          const profile = JSON.parse(profileAlt);
          if (!profile.onboardingComplete) {
            router.push('/onboarding');
            return;
          }
        } else {
          router.push('/onboarding');
          return;
        }
      }
    } catch {
      router.push('/onboarding');
      return;
    }

    // Load data
    const today = getToday();

    // Daily log
    const log = getDailyLog(today);
    setDailyLog(log);

    // Last uric acid reading
    const readings = getUricAcidReadings();
    setLastUricAcid(readings.length > 0 ? readings[0] : null);

    // Days since last flare
    const flares = getGoutFlares();
    if (flares.length > 0) {
      const latestFlareDate = flares[0].date;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const flareDate = new Date(latestFlareDate + 'T00:00:00');
      flareDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (now.getTime() - flareDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      setDaysSinceFlare(diffDays);
    } else {
      setDaysSinceFlare(null);
    }

    // Water intake
    const water = getWaterIntake(today);
    setWaterIntake(water);

    setMounted(true);
  }, [router]);

  if (!mounted) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const purineTarget = 400;
  const currentPurine = dailyLog?.totalPurine || 0;
  const purineRatio = purineTarget > 0 ? currentPurine / purineTarget : 0;
  const purinePercent = Math.min(purineRatio * 100, 100);

  // Color: green if under 50%, yellow if 50-80%, red if over 80%
  let progressColor = 'var(--color-success)';
  if (purineRatio > 0.8) {
    progressColor = 'var(--color-danger)';
  } else if (purineRatio >= 0.5) {
    progressColor = 'var(--color-warning)';
  }

  const uricAcidValue = lastUricAcid ? lastUricAcid.value.toFixed(1) : '--';
  const uricAcidColor = lastUricAcid
    ? getUricAcidColor(lastUricAcid.value)
    : 'var(--color-gray-400)';

  const currentWater = waterIntake?.total || 0;
  const foods = dailyLog?.foods || [];

  return (
    <div className="page-container">
      {/* Greeting Header with Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 16, paddingBottom: 20 }}>
        <ShieldIcon size={32} color="var(--color-primary)" />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
            GoutCare
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-gray-500)', margin: 0 }}>
            Your daily gout management dashboard
          </p>
        </div>
      </div>

      {/* Daily Purine Progress */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-header" style={{ marginBottom: 10 }}>
          <span className="section-title">Daily Purine Progress</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: progressColor }}>
            {currentPurine} / {purineTarget} mg
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${purinePercent}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-gray-500)', marginTop: 6, textAlign: 'center' }}>
          {Math.max(0, purineTarget - currentPurine)} mg remaining today
        </p>
      </div>

      {/* Stats Row */}
      <div className="stats-row" style={{ marginBottom: 16 }}>
        {/* Current Uric Acid */}
        <div className="stat-card">
          <span className="stat-value" style={{ color: uricAcidColor }}>
            {uricAcidValue}
          </span>
          <span className="stat-label">Uric Acid (mg/dL)</span>
        </div>

        {/* Days Since Last Flare */}
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--color-orange)' }}>
            {daysSinceFlare !== null ? daysSinceFlare : 'None'}
          </span>
          <span className="stat-label">
            {daysSinceFlare !== null ? 'Days since flare' : 'No flares'}
          </span>
        </div>

        {/* Water Intake Today */}
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--color-cyan)' }}>
            {currentWater}
          </span>
          <span className="stat-label">Water (oz) today</span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-header" style={{ marginBottom: 10 }}>
          <span className="section-title">Quick Actions</span>
        </div>
        <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Scan Food */}
          <Link href="/scanner" className="quick-action-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-blue-light)', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.15s ease' }}>
            <div className="quick-action-icon" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScanIcon size={22} color="#ffffff" />
            </div>
            <span className="quick-action-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-blue)' }}>Scan Food</span>
          </Link>

          {/* Log Uric Acid */}
          <Link href="/uric-acid" className="quick-action-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-green-light)', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.15s ease' }}>
            <div className="quick-action-icon" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--color-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChartIcon size={22} color="#ffffff" />
            </div>
            <span className="quick-action-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-green)' }}>Log Uric Acid</span>
          </Link>

          {/* Log Flare */}
          <Link href="/flares" className="quick-action-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-danger-light)', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.15s ease' }}>
            <div className="quick-action-icon" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlameIcon size={22} color="#ffffff" />
            </div>
            <span className="quick-action-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-danger)' }}>Log Flare</span>
          </Link>

          {/* Log Water */}
          <Link href="/hydration" className="quick-action-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-cyan-light)', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.15s ease' }}>
            <div className="quick-action-icon" style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'var(--color-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DropletIcon size={22} color="#ffffff" />
            </div>
            <span className="quick-action-label" style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-cyan)' }}>Log Water</span>
          </Link>
        </div>
      </div>

      {/* Today's Foods */}
      <div>
        <div className="section-header" style={{ marginBottom: 10 }}>
          <span className="section-title">Today&apos;s Foods</span>
        </div>

        {foods.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 16px' }}>
            <ForkKnifeIcon size={36} color="var(--color-gray-300)" />
            <p style={{ fontSize: 14, color: 'var(--color-gray-400)', marginTop: 10 }}>
              No foods logged yet today
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 4 }}>
              Scan a meal or search the database to get started
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {foods.map((food: FoodEntry) => (
              <div
                key={food.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>
                    {food.name}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                    {formatTime(food.timestamp)}
                  </span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-orange)' }}>
                  {food.purineContent} mg
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
