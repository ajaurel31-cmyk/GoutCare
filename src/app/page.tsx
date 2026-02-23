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
      <div className="page-container flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const purineTarget = 400;
  const currentPurine = dailyLog?.totalPurine || 0;
  const purineRatio = purineTarget > 0 ? currentPurine / purineTarget : 0;
  const purinePercent = Math.min(purineRatio * 100, 100);

  let progressColor = '#34d399';
  if (purineRatio > 0.8) {
    progressColor = '#f87171';
  } else if (purineRatio >= 0.5) {
    progressColor = '#fbbf24';
  }

  const uricAcidValue = lastUricAcid ? lastUricAcid.value.toFixed(1) : '--';
  const uricAcidColor = lastUricAcid
    ? getUricAcidColor(lastUricAcid.value)
    : 'var(--color-text-tertiary)';

  const currentWater = waterIntake?.total || 0;
  const foods = dailyLog?.foods || [];

  return (
    <div className="page-container">
      {/* ── Gradient Hero Header ──────────────────────────────────────── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-header">
          <div className="dashboard-hero-logo">
            <ShieldIcon size={24} color="#ffffff" />
          </div>
          <div>
            <h1 className="dashboard-hero h1">GoutCare</h1>
            <p className="dashboard-hero-subtitle">Your daily gout management dashboard</p>
          </div>
        </div>

        {/* Purine Progress — glass card inside the hero */}
        <div className="purine-hero-card">
          <div className="purine-hero-header">
            <span className="purine-hero-title">Daily Purine</span>
            <span className="purine-hero-value">
              {currentPurine} / {purineTarget} mg
            </span>
          </div>
          <div className="purine-hero-bar">
            <div
              className="purine-hero-bar-fill"
              style={{
                width: `${purinePercent}%`,
                background: progressColor,
              }}
            />
          </div>
          <p className="purine-hero-remaining">
            {Math.max(0, purineTarget - currentPurine)} mg remaining today
          </p>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value" style={{ color: uricAcidColor }}>
            {uricAcidValue}
          </span>
          <span className="stat-label">Uric Acid</span>
        </div>

        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--color-orange)' }}>
            {daysSinceFlare !== null ? daysSinceFlare : '--'}
          </span>
          <span className="stat-label">
            {daysSinceFlare !== null ? 'Days no flare' : 'No flares'}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--color-cyan)' }}>
            {currentWater}
          </span>
          <span className="stat-label">Water (oz)</span>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <div className="section" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <span className="section-title">Quick Actions</span>
        </div>
        <div className="quick-actions">
          <Link
            href="/scanner"
            className="quick-action-btn"
            style={{ backgroundColor: 'var(--color-blue-light)' }}
          >
            <div
              className="quick-action-icon"
              style={{ backgroundColor: 'var(--color-blue)' }}
            >
              <ScanIcon size={22} color="#ffffff" />
            </div>
            <span className="quick-action-label" style={{ color: 'var(--color-blue)' }}>
              Scan Food
            </span>
          </Link>

          <Link
            href="/uric-acid"
            className="quick-action-btn"
            style={{ backgroundColor: 'var(--color-green-light)' }}
          >
            <div
              className="quick-action-icon"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              <ChartIcon size={22} color="#ffffff" />
            </div>
            <span className="quick-action-label" style={{ color: 'var(--color-green)' }}>
              Log Uric Acid
            </span>
          </Link>

          <Link
            href="/flares"
            className="quick-action-btn"
            style={{ backgroundColor: 'var(--color-danger-light)' }}
          >
            <div
              className="quick-action-icon"
              style={{ backgroundColor: 'var(--color-danger)' }}
            >
              <FlameIcon size={22} color="#ffffff" />
            </div>
            <span className="quick-action-label" style={{ color: 'var(--color-danger)' }}>
              Log Flare
            </span>
          </Link>

          <Link
            href="/hydration"
            className="quick-action-btn"
            style={{ backgroundColor: 'var(--color-cyan-light)' }}
          >
            <div
              className="quick-action-icon"
              style={{ backgroundColor: 'var(--color-cyan)' }}
            >
              <DropletIcon size={22} color="#ffffff" />
            </div>
            <span className="quick-action-label" style={{ color: 'var(--color-cyan)' }}>
              Log Water
            </span>
          </Link>
        </div>
      </div>

      {/* ── Today's Foods ─────────────────────────────────────────────── */}
      <div className="section">
        <div className="section-header">
          <span className="section-title">Today&apos;s Foods</span>
          {foods.length > 0 && (
            <Link href="/database" className="section-action">
              Add more
            </Link>
          )}
        </div>

        {foods.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ForkKnifeIcon size={26} color="var(--color-primary)" />
              </div>
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: 4,
              }}
            >
              No foods logged yet
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
              Scan a meal or search the database to start tracking
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {foods.map((food: FoodEntry) => (
              <div key={food.id} className="food-log-card">
                <div>
                  <div className="food-log-name">{food.name}</div>
                  <div className="food-log-time">{formatTime(food.timestamp)}</div>
                </div>
                <span
                  className="food-log-purine"
                  style={{
                    color:
                      food.purineContent > 200
                        ? 'var(--color-danger)'
                        : food.purineContent > 100
                        ? 'var(--color-warning)'
                        : 'var(--color-success)',
                  }}
                >
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
