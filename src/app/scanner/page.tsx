'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  getScanCount,
  incrementScanCount,
  addFoodEntry,
  getSubscriptionStatus,
} from '@/lib/storage';
import { isSubscribed } from '@/lib/subscription';
import { isNative } from '@/lib/platform';
import { getToday, getPurineLevelLabel, generateId } from '@/lib/utils';
import { FREE_SCAN_LIMIT } from '@/lib/constants';
import type { ScanResult } from '@/lib/types';
import CameraIcon from '@/components/icons/CameraIcon';
import ScanIcon from '@/components/icons/ScanIcon';

// ─── Toast Component ────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onDone,
}: {
  message: string;
  type: 'success' | 'error' | 'warning';
  onDone: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return <div className={`toast toast-${type}`}>{message}</div>;
}

// ─── Scan Result Display Component ──────────────────────────────────────────

function ScanResultDisplay({
  result,
  onAddToLog,
  onScanAnother,
  addedToLog,
}: {
  result: ScanResult;
  onAddToLog: () => void;
  onScanAnother: () => void;
  addedToLog: boolean;
}) {
  const levelClass = `badge badge-${result.purineLevel === 'very-high' ? 'very-high' : result.purineLevel}`;

  return (
    <div className="scan-result">
      {/* Header */}
      <div className="scan-result-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="card-title">Scan Results</span>
          <span className={levelClass}>
            {getPurineLevelLabel(result.purineLevel)}
          </span>
        </div>
        {result.foods.length > 0 && (
          <div className="scan-result-foods">
            {result.foods.map((food, i) => (
              <span key={i} className="badge badge-info">
                {food}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="scan-result-body">
        {/* Estimated Purine */}
        <div className="scan-result-purine-box">
          <div style={{ textAlign: 'center' }}>
            <div className="scan-result-purine-value" style={{
              color: result.purineLevel === 'low'
                ? 'var(--color-success)'
                : result.purineLevel === 'moderate'
                ? 'var(--color-warning)'
                : 'var(--color-danger)',
            }}>
              {result.estimatedPurine}
            </div>
            <div className="scan-result-purine-label">
              Estimated mg purines per serving
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="scan-result-section">
          <h4>Analysis</h4>
          <p>{result.explanation}</p>
        </div>

        {/* Safety During Flare */}
        {result.safetyDuringFlare && (
          <div className="scan-result-section">
            <h4>During a Flare</h4>
            <p>{result.safetyDuringFlare}</p>
          </div>
        )}

        {/* Risk Factors */}
        {result.riskFactors && result.riskFactors.length > 0 && (
          <div className="scan-result-section">
            <h4>Risk Factors</h4>
            <ul>
              {result.riskFactors.map((risk, i) => (
                <li key={i}>{risk}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {result.benefits && result.benefits.length > 0 && (
          <div className="scan-result-section">
            <h4>Benefits</h4>
            <ul>
              {result.benefits.map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Alternatives */}
        {result.alternatives && result.alternatives.length > 0 && (
          <div className="scan-result-section">
            <h4>Lower-Purine Alternatives</h4>
            <ul>
              {result.alternatives.map((alt, i) => (
                <li key={i}>{alt}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
        <button
          className="btn btn-success btn-full"
          onClick={onAddToLog}
          disabled={addedToLog}
        >
          {addedToLog ? 'Added to Log' : 'Add to Daily Log'}
        </button>
        <button
          className="btn btn-secondary btn-full"
          onClick={onScanAnother}
        >
          Scan Another
        </button>
      </div>
    </div>
  );
}

// ─── Loading Shimmer ────────────────────────────────────────────────────────

function LoadingShimmer() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="shimmer" style={{ width: 120, height: 20 }} />
        <div className="shimmer" style={{ width: 70, height: 24, borderRadius: 999 }} />
      </div>
      <div className="shimmer" style={{ width: '100%', height: 80, marginTop: 4 }} />
      <div className="shimmer" style={{ width: '100%', height: 16 }} />
      <div className="shimmer" style={{ width: '80%', height: 16 }} />
      <div className="shimmer" style={{ width: '60%', height: 16 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <div className="shimmer" style={{ width: '100%', height: 16 }} />
        <div className="shimmer" style={{ width: '100%', height: 16 }} />
      </div>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        <p style={{ fontSize: 14, color: 'var(--color-gray-500)', marginTop: 12 }}>
          Analyzing your food with AI...
        </p>
      </div>
    </div>
  );
}

// ─── Main Scanner Page ──────────────────────────────────────────────────────

export default function ScannerPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [addedToLog, setAddedToLog] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [scansUsed, setScansUsed] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load scan count and subscription status
  React.useEffect(() => {
    setScansUsed(getScanCount());
    setIsPremium(isSubscribed());
  }, []);

  const scansRemaining = isPremium ? Infinity : FREE_SCAN_LIMIT - scansUsed;

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type });
  }, []);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get raw base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file input change (web)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setBase64Image(base64);
      setImagePreview(URL.createObjectURL(file));
      setScanResult(null);
      setAddedToLog(false);
    } catch {
      showToast('Failed to load image. Please try again.', 'error');
    }
  };

  // Handle camera area click
  const handleCameraClick = async () => {
    if (isNative()) {
      // Use Capacitor Camera plugin on native
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const photo = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt,
          width: 1024,
          height: 1024,
        });

        if (photo.base64String) {
          setBase64Image(photo.base64String);
          setImagePreview(`data:image/${photo.format};base64,${photo.base64String}`);
          setScanResult(null);
          setAddedToLog(false);
        }
      } catch (err: any) {
        // User cancelled or camera error
        if (err?.message !== 'User cancelled photos app') {
          showToast('Camera error. Please try again.', 'error');
        }
      }
    } else {
      // Web: trigger file input
      fileInputRef.current?.click();
    }
  };

  // Handle analyze
  const handleAnalyze = async () => {
    if (!base64Image) return;

    // Check scan limit
    if (!isPremium && scansRemaining <= 0) {
      showToast('Daily scan limit reached. Upgrade to Premium for unlimited scans.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setScanResult(null);
    setAddedToLog(false);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [base64Image] }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Analysis failed (${response.status})`);
      }

      const data = await response.json();

      // Validate response shape
      if (!data || typeof data.estimatedPurine !== 'number') {
        throw new Error('Invalid response from server');
      }

      setScanResult(data as ScanResult);

      // Increment scan count
      const newCount = incrementScanCount();
      setScansUsed(newCount);
    } catch (err: any) {
      showToast(
        err?.message || 'Failed to analyze food. Please check your connection and try again.',
        'error'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle add to daily log
  const handleAddToLog = () => {
    if (!scanResult) return;

    const today = getToday();
    const foodName = scanResult.foods.length > 0
      ? scanResult.foods.join(', ')
      : 'Scanned Food';

    addFoodEntry(today, {
      foodId: `scan-${generateId()}`,
      name: foodName,
      servingSize: '1 serving',
      purineContent: scanResult.estimatedPurine,
    });

    setAddedToLog(true);
    showToast(`Added "${foodName}" (${scanResult.estimatedPurine} mg) to today's log.`, 'success');
  };

  // Handle scan another
  const handleScanAnother = () => {
    setImagePreview(null);
    setBase64Image(null);
    setScanResult(null);
    setAddedToLog(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1>Food Scanner</h1>
          <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 2 }}>
            Take a photo to analyze purine content
          </p>
        </div>
        {!isPremium && (
          <span className={`badge ${scansRemaining <= 1 ? 'badge-warning' : 'badge-info'}`}>
            {scansRemaining}/{FREE_SCAN_LIMIT} scans
          </span>
        )}
      </div>

      {/* ── Scan Limit Reached ──────────────────────────────────────────── */}
      {!isPremium && scansRemaining <= 0 && !scanResult && (
        <div className="premium-gate" style={{ marginBottom: 16 }}>
          <span className="premium-gate-title">Daily Scan Limit Reached</span>
          <p className="premium-gate-text">
            You&apos;ve used all {FREE_SCAN_LIMIT} free scans for today. Upgrade to GoutCare Premium
            for unlimited AI food analysis.
          </p>
          <Link href="/settings/subscription" className="btn btn-primary">
            Upgrade to Premium
          </Link>
        </div>
      )}

      {/* ── Camera / Upload Area ────────────────────────────────────────── */}
      {!imagePreview ? (
        <div
          className="camera-area"
          onClick={handleCameraClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCameraClick();
            }
          }}
        >
          <CameraIcon size={48} color="var(--color-gray-400)" />
          <span className="camera-area-text">
            Tap to take a photo or upload an image
          </span>
          <span className="camera-area-hint">
            Supported formats: JPG, PNG, HEIC
          </span>
          {/* Hidden file input for web */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden-input"
            aria-label="Upload food image"
          />
        </div>
      ) : (
        <div>
          {/* Image Preview */}
          <div className="image-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Food to analyze" />
          </div>

          {/* Change Image Button */}
          {!isAnalyzing && !scanResult && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button
                className="btn btn-secondary btn-full"
                onClick={handleCameraClick}
              >
                <CameraIcon size={18} />
                Change Photo
              </button>
              {/* Hidden file input for web */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden-input"
                aria-label="Upload food image"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Analyze Button ──────────────────────────────────────────────── */}
      {imagePreview && !isAnalyzing && !scanResult && (
        <button
          className="btn btn-primary btn-lg btn-full"
          style={{ marginTop: 16 }}
          onClick={handleAnalyze}
          disabled={!base64Image || (!isPremium && scansRemaining <= 0)}
        >
          <ScanIcon size={20} color="#ffffff" />
          Analyze Food
        </button>
      )}

      {/* ── Loading State ───────────────────────────────────────────────── */}
      {isAnalyzing && (
        <div style={{ marginTop: 20 }}>
          <LoadingShimmer />
        </div>
      )}

      {/* ── Scan Results ────────────────────────────────────────────────── */}
      {scanResult && !isAnalyzing && (
        <div style={{ marginTop: 20 }}>
          <ScanResultDisplay
            result={scanResult}
            onAddToLog={handleAddToLog}
            onScanAnother={handleScanAnother}
            addedToLog={addedToLog}
          />
        </div>
      )}

      {/* ── Disclaimer ──────────────────────────────────────────────────── */}
      <p className="disclaimer">
        AI analysis provides estimates only. Actual purine content may vary based on
        preparation method, portion size, and ingredients.
      </p>
    </div>
  );
}
