'use client';

import { useState, useMemo } from 'react';
import { CloseIcon, ForkKnifeIcon, CheckIcon, SearchIcon } from '@/components/icons';
import { purineDatabase } from '@/lib/purine-database';
import type { FoodItem } from '@/lib/types';

interface Props {
  onClose: () => void;
  onSave: (food: { foodId: string; name: string; servingSize: string; purineContent: number }) => void;
}

function purineBadgeColor(mg: number): string {
  if (mg <= 100) return 'var(--purine-low)';
  if (mg <= 200) return 'var(--purine-moderate)';
  if (mg <= 300) return 'var(--purine-high)';
  return 'var(--purine-very-high)';
}

export default function FoodLogModal({ onClose, onSave }: Props) {
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return purineDatabase
      .filter((f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))
      .slice(0, 20);
  }, [search]);

  const handleSelect = (food: FoodItem) => {
    setSelectedFood(food);
  };

  const handleSave = () => {
    if (selectedFood) {
      onSave({
        foodId: selectedFood.id,
        name: selectedFood.name,
        servingSize: selectedFood.servingSize,
        purineContent: selectedFood.purineContent,
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ForkKnifeIcon size={22} color="var(--accent)" />
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add Food</h2>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ padding: 4 }}>
            <CloseIcon size={20} color="var(--text-tertiary)" />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1, display: 'flex' }}>
            <SearchIcon size={18} color="var(--text-tertiary)" />
          </div>
          <input
            className="input"
            type="text"
            placeholder="Search foods (e.g. chicken, salmon, beer)..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedFood(null); }}
            autoFocus
            aria-label="Search foods"
            style={{ paddingLeft: 40 }}
          />
        </div>

        {/* Selected Food Preview */}
        {selectedFood && (
          <div style={{
            background: 'var(--accent-light)',
            border: '1.5px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{selectedFood.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {selectedFood.category} &middot; {selectedFood.servingSize}
                </div>
              </div>
              <span style={{
                fontSize: 16,
                fontWeight: 800,
                color: purineBadgeColor(selectedFood.purineContent),
              }}>
                {selectedFood.purineContent} mg
              </span>
            </div>
            {selectedFood.description && (
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.4 }}>
                {selectedFood.description}
              </p>
            )}
            {selectedFood.warnings && selectedFood.warnings.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {selectedFood.warnings.map((w, i) => (
                  <span key={i} className="badge badge-danger">{w}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {search.trim() && !selectedFood && (
          <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 16 }}>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>No foods found for &ldquo;{search}&rdquo;</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {results.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelect(food)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background var(--transition)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-input)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{food.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {food.category} &middot; {food.servingSize}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: purineBadgeColor(food.purineContent),
                      whiteSpace: 'nowrap',
                    }}>
                      {food.purineContent} mg
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prompt */}
        {!search.trim() && !selectedFood && (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
              Search from {purineDatabase.length}+ foods with purine data
            </p>
          </div>
        )}

        {/* Save Button */}
        <button
          className="btn btn-primary btn-full btn-lg"
          disabled={!selectedFood}
          onClick={handleSave}
        >
          <CheckIcon size={18} color="#fff" />
          <span>Add to Today&apos;s Log</span>
        </button>
      </div>
    </div>
  );
}
