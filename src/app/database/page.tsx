'use client';

import { useState, useMemo } from 'react';
import { SearchIcon, AlertIcon } from '@/components/icons';
import { purineDatabase } from '@/lib/purine-database';
import type { FoodItem, PurineCategory } from '@/lib/types';

const ALL_CATEGORIES: PurineCategory[] = [
  'Fruits', 'Vegetables', 'Grains', 'Dairy', 'Meats', 'Seafood',
  'Organ Meats', 'Legumes', 'Nuts & Seeds', 'Beverages', 'Condiments', 'Snacks', 'Alcohol',
];

function purineBadgeColor(mg: number): string {
  if (mg <= 100) return 'var(--purine-low)';
  if (mg <= 200) return 'var(--purine-moderate)';
  if (mg <= 300) return 'var(--purine-high)';
  return 'var(--purine-very-high)';
}

function purineLevelLabel(mg: number): string {
  if (mg <= 100) return 'Low';
  if (mg <= 200) return 'Moderate';
  if (mg <= 300) return 'High';
  return 'Very High';
}

function FoodCard({ food, expanded, onToggle }: { food: FoodItem; expanded: boolean; onToggle: () => void }) {
  const color = purineBadgeColor(food.purineContent);

  return (
    <button
      className="card"
      onClick={onToggle}
      style={{ textAlign: 'left', cursor: 'pointer', padding: expanded ? '14px 16px' : '12px 16px', width: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{food.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {food.servingSize}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color }}>{food.purineContent} mg</span>
          <div style={{ fontSize: 11, fontWeight: 600, color, marginTop: 2 }}>{purineLevelLabel(food.purineContent)}</div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {food.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
              {food.description}
            </p>
          )}
          {food.warnings && food.warnings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {food.warnings.map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flexShrink: 0, marginTop: 1 }}>
                    <AlertIcon size={14} color="var(--danger)" />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 500, lineHeight: 1.4 }}>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </button>
  );
}

export default function DatabasePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<PurineCategory | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let items = purineDatabase;

    if (activeCategory !== 'all') {
      items = items.filter((f) => f.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
      );
    }

    return items;
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    if (search.trim() || activeCategory !== 'all') return null;
    const groups: Record<string, FoodItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered, search, activeCategory]);

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of purineDatabase) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div style={{ paddingTop: 20 }}>
      {/* Header */}
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Food Database</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
        {purineDatabase.length} foods with purine data
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <SearchIcon size={16} color="var(--text-tertiary)" />
        </div>
        <input
          className="input"
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {/* Category Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' as React.CSSProperties['msOverflowStyle'] }}>
        <button
          onClick={() => setActiveCategory('all')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            background: activeCategory === 'all' ? 'var(--accent)' : 'var(--bg-input)',
            color: activeCategory === 'all' ? '#fff' : 'var(--text-secondary)',
            border: `1.5px solid ${activeCategory === 'all' ? 'var(--accent)' : 'var(--border-strong)'}`,
            flexShrink: 0,
          }}
        >
          All
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: activeCategory === cat ? 'var(--accent)' : 'var(--bg-input)',
              color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
              border: `1.5px solid ${activeCategory === cat ? 'var(--accent)' : 'var(--border-strong)'}`,
              flexShrink: 0,
            }}
          >
            {cat} ({categoryCount[cat] || 0})
          </button>
        ))}
      </div>

      {/* Results count */}
      {(search.trim() || activeCategory !== 'all') && (
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {search.trim() ? ` for "${search}"` : ''}
          {activeCategory !== 'all' ? ` in ${activeCategory}` : ''}
        </p>
      )}

      {/* Food List */}
      {filtered.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '40vh' }}>
          <div className="empty-icon">
            <SearchIcon size={28} />
          </div>
          <div className="empty-title">No foods found</div>
          <div className="empty-text">Try a different search term or category.</div>
        </div>
      ) : grouped ? (
        ALL_CATEGORIES.filter((cat) => grouped[cat]?.length).map((cat) => (
          <div key={cat} className="section">
            <div className="section-label">{cat}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {grouped[cat].map((food) => (
                <FoodCard key={food.id} food={food} expanded={expanded === food.id} onToggle={() => setExpanded(expanded === food.id ? null : food.id)} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} expanded={expanded === food.id} onToggle={() => setExpanded(expanded === food.id ? null : food.id)} />
          ))}
        </div>
      )}

      {/* Purine Legend */}
      <div style={{ marginTop: 32, marginBottom: 16, padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Purine Levels (per 100g)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Low', range: '0–100 mg', color: 'var(--purine-low)' },
            { label: 'Moderate', range: '100–200 mg', color: 'var(--purine-moderate)' },
            { label: 'High', range: '200–300 mg', color: 'var(--purine-high)' },
            { label: 'Very High', range: '300+ mg', color: 'var(--purine-very-high)' },
          ].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 'var(--radius-full)', background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}><strong style={{ color: l.color }}>{l.label}</strong> {l.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
