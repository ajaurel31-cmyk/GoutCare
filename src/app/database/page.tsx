'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { purineDatabase } from '@/lib/purine-database';
import { addFoodEntry } from '@/lib/storage';
import { isSubscribed } from '@/lib/subscription';
import { getToday, getPurineLevelLabel } from '@/lib/utils';
import type { FoodItem, PurineCategory, PurineLevel } from '@/lib/types';
import SearchIcon from '@/components/icons/SearchIcon';
import PlusIcon from '@/components/icons/PlusIcon';

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES: ('All' | PurineCategory)[] = [
  'All',
  'Meats',
  'Seafood',
  'Vegetables',
  'Dairy',
  'Grains',
  'Beverages',
  'Fruits',
  'Nuts & Seeds',
  'Legumes',
];

const PURINE_LEVELS: ('All' | PurineLevel)[] = [
  'All',
  'low',
  'moderate',
  'high',
  'very-high',
];

const PURINE_LEVEL_LABELS: Record<string, string> = {
  'All': 'All',
  'low': 'Low',
  'moderate': 'Moderate',
  'high': 'High',
  'very-high': 'Very High',
};

const FREE_ITEM_LIMIT = 50;

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

// ─── ChevronDown Icon ───────────────────────────────────────────────────────

function ChevronDownIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ─── Food Card Component ────────────────────────────────────────────────────

function FoodCard({
  food,
  isExpanded,
  onToggle,
  onAddToLog,
}: {
  food: FoodItem;
  isExpanded: boolean;
  onToggle: () => void;
  onAddToLog: (food: FoodItem) => void;
}) {
  const badgeClass = `badge badge-${food.purineLevel === 'very-high' ? 'very-high' : food.purineLevel}`;

  return (
    <div className="food-card">
      <div className="food-card-header" onClick={onToggle}>
        <div className="food-card-left">
          <span className="food-card-name">{food.name}</span>
          <span className="food-card-category">{food.category}</span>
        </div>
        <div className="food-card-right">
          <div className="food-card-purine">
            <span>{food.purineContent}</span>
            <span className="food-card-purine-unit"> mg/100g</span>
          </div>
          <span className={badgeClass}>
            {getPurineLevelLabel(food.purineLevel)}
          </span>
          <ChevronDownIcon
            size={18}
            className={`chevron ${isExpanded ? 'chevron-open' : ''}`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="food-card-details">
          {/* Detail rows */}
          <div className="food-card-detail-row">
            <span className="food-card-detail-label">Serving Size</span>
            <span className="food-card-detail-value">{food.servingSize}</span>
          </div>

          <div className="food-card-detail-row">
            <span className="food-card-detail-label">Purine Level</span>
            <span className="food-card-detail-value">
              {getPurineLevelLabel(food.purineLevel)} ({food.purineContent} mg/100g)
            </span>
          </div>

          {food.description && (
            <div className="food-card-detail-row">
              <span className="food-card-detail-label">Notes</span>
              <span className="food-card-detail-value" style={{ textAlign: 'right', maxWidth: '60%' }}>
                {food.description}
              </span>
            </div>
          )}

          {food.warnings && food.warnings.length > 0 && (
            <div style={{
              background: 'var(--color-danger-light)',
              padding: '10px 12px',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: 13,
            }}>
              <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: 4 }}>
                Warnings
              </strong>
              {food.warnings.map((w, i) => (
                <div key={i} style={{ color: 'var(--color-gray-700)', marginTop: i > 0 ? 2 : 0 }}>
                  &bull; {w}
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-success btn-sm btn-full"
            onClick={(e) => {
              e.stopPropagation();
              onAddToLog(food);
            }}
          >
            <PlusIcon size={16} />
            Add to Today&apos;s Log
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Database Page ─────────────────────────────────────────────────────

export default function DatabasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | PurineCategory>('All');
  const [selectedLevel, setSelectedLevel] = useState<'All' | PurineLevel>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    setPremium(isSubscribed());
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setToast({ message, type });
  }, []);

  // Filter and sort the database
  const filteredFoods = useMemo(() => {
    let results = [...purineDatabase];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      results = results.filter((food) =>
        food.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      results = results.filter((food) => food.category === selectedCategory);
    }

    // Purine level filter
    if (selectedLevel !== 'All') {
      results = results.filter((food) => food.purineLevel === selectedLevel);
    }

    // Sort alphabetically by name
    results.sort((a, b) => a.name.localeCompare(b.name));

    return results;
  }, [searchQuery, selectedCategory, selectedLevel]);

  // Apply premium gate
  const displayedFoods = premium
    ? filteredFoods
    : filteredFoods.slice(0, FREE_ITEM_LIMIT);

  const isGated = !premium && filteredFoods.length > FREE_ITEM_LIMIT;

  // Handle add to log
  const handleAddToLog = (food: FoodItem) => {
    const today = getToday();
    addFoodEntry(today, {
      foodId: food.id,
      name: food.name,
      servingSize: food.servingSize,
      purineContent: food.purineContent,
    });
    showToast(`Added "${food.name}" (${food.purineContent} mg) to today's log.`, 'success');
  };

  // Toggle expanded card
  const handleToggle = (foodId: string) => {
    setExpandedId((prev) => (prev === foodId ? null : foodId));
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
          <h1>Purine Database</h1>
          <p style={{ fontSize: 13, color: 'var(--color-gray-500)', marginTop: 2 }}>
            Search {purineDatabase.length}+ foods by purine content
          </p>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <div className="input-with-icon">
        <SearchIcon size={20} />
        <input
          type="text"
          className="input"
          placeholder="Search foods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search foods"
        />
      </div>

      {/* ── Category Filter ─────────────────────────────────────────────── */}
      <div style={{ marginTop: 12 }}>
        <div className="chip-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${selectedCategory === cat ? 'chip-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Purine Level Filter ─────────────────────────────────────────── */}
      <div style={{ marginTop: 8 }}>
        <div className="chip-row">
          {PURINE_LEVELS.map((level) => (
            <button
              key={level}
              className={`chip ${selectedLevel === level ? 'chip-active' : ''}`}
              onClick={() => setSelectedLevel(level)}
            >
              {PURINE_LEVEL_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results Count ───────────────────────────────────────────────── */}
      <div className="results-count" style={{ marginTop: 12 }}>
        Showing {displayedFoods.length}{isGated ? ` of ${filteredFoods.length}` : ''} food{filteredFoods.length !== 1 ? 's' : ''}
      </div>

      {/* ── Food List ───────────────────────────────────────────────────── */}
      {displayedFoods.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 24 }}>
          <div className="empty-state-icon">
            <SearchIcon size={40} color="var(--color-gray-300)" />
          </div>
          <span className="empty-state-text">No foods found</span>
          <span className="empty-state-hint">
            Try adjusting your search or filters
          </span>
        </div>
      ) : (
        <div className="food-list" style={{ marginTop: 4 }}>
          {displayedFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              isExpanded={expandedId === food.id}
              onToggle={() => handleToggle(food.id)}
              onAddToLog={handleAddToLog}
            />
          ))}
        </div>
      )}

      {/* ── Premium Gate ────────────────────────────────────────────────── */}
      {isGated && (
        <div className="premium-gate" style={{ marginTop: 16 }}>
          <span className="premium-gate-title">
            Unlock All {filteredFoods.length} Foods
          </span>
          <p className="premium-gate-text">
            Free users can browse {FREE_ITEM_LIMIT} foods. Upgrade to GoutCare Premium to access
            the complete database of {purineDatabase.length}+ foods with detailed purine data.
          </p>
          <Link href="/settings/subscription" className="btn btn-primary">
            Upgrade to Premium
          </Link>
        </div>
      )}

      {/* ── Disclaimer ──────────────────────────────────────────────────── */}
      <p className="disclaimer">
        Purine values are approximate estimates based on published research. Actual content
        may vary based on preparation method and source.
      </p>
    </div>
  );
}
