'use client';

import React, { useState } from 'react';
import { ChevronIcon, PlusIcon } from '@/components/icons';
import { FoodItem } from '@/lib/types';
import { getPurineLevelLabel } from '@/lib/utils';

interface FoodCardProps {
  food: FoodItem;
  onAddToLog?: (food: FoodItem) => void;
  showAddButton?: boolean;
}

export default function FoodCard({ food, onAddToLog, showAddButton = false }: FoodCardProps) {
  const [expanded, setExpanded] = useState(false);

  const purineLevelClass = `purine-badge purine-${food.purineLevel}`;

  return (
    <div className="food-card" role="article">
      <button
        className="food-card-header"
        onClick={() => setExpanded(!expanded)}
        type="button"
        aria-expanded={expanded}
      >
        <div className="food-card-info">
          <h3 className="food-card-name">{food.name}</h3>
          <div className="food-card-meta">
            <span className="food-card-category">{food.category}</span>
            <span className="food-card-purine">
              {food.purineContent} mg/100g
            </span>
          </div>
        </div>
        <div className="food-card-badges">
          <span className={purineLevelClass}>
            {getPurineLevelLabel(food.purineLevel)}
          </span>
          <ChevronIcon
            direction={expanded ? 'up' : 'down'}
            size={18}
            className="food-card-chevron"
          />
        </div>
      </button>

      {expanded && (
        <div className="food-card-details">
          {food.description && (
            <p className="food-card-description">{food.description}</p>
          )}

          <div className="food-card-detail-row">
            <span className="food-card-detail-label">Serving Size:</span>
            <span className="food-card-detail-value">{food.servingSize}</span>
          </div>

          {food.warnings && food.warnings.length > 0 && (
            <div className="food-card-warnings">
              <span className="food-card-warnings-label">Warnings:</span>
              <ul className="food-card-warnings-list">
                {food.warnings.map((warning, index) => (
                  <li key={index} className="food-card-warning-item">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showAddButton && onAddToLog && (
            <button
              className="food-card-add-button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToLog(food);
              }}
              type="button"
            >
              <PlusIcon size={18} />
              Add to Log
            </button>
          )}
        </div>
      )}
    </div>
  );
}
