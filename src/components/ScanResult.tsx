'use client';

import React from 'react';
import { ScanResult as ScanResultType } from '@/lib/types';
import { getPurineLevelLabel } from '@/lib/utils';
import { CheckIcon, AlertIcon, ShieldIcon, PlusIcon } from '@/components/icons';

interface ScanResultProps {
  result: ScanResultType;
  onAddToLog?: () => void;
}

const levelColorMap: Record<string, string> = {
  'low': 'var(--color-success, #22c55e)',
  'moderate': 'var(--color-warning, #f59e0b)',
  'high': 'var(--color-danger, #ef4444)',
  'very-high': 'var(--color-critical, #dc2626)',
};

const levelBgClass: Record<string, string> = {
  'low': 'scan-result-level-low',
  'moderate': 'scan-result-level-moderate',
  'high': 'scan-result-level-high',
  'very-high': 'scan-result-level-very-high',
};

export default function ScanResult({ result, onAddToLog }: ScanResultProps) {
  const levelColor = levelColorMap[result.purineLevel] || levelColorMap['moderate'];

  return (
    <div className="scan-result">
      {/* Purine Level Badge */}
      <div className={`scan-result-level ${levelBgClass[result.purineLevel]}`}>
        <span className="scan-result-level-label">
          {getPurineLevelLabel(result.purineLevel)} Purine
        </span>
        <span className="scan-result-level-value">
          ~{result.estimatedPurine} mg
        </span>
      </div>

      {/* Foods Detected */}
      {result.foods.length > 0 && (
        <div className="scan-result-section">
          <h3 className="scan-result-section-title">Foods Detected</h3>
          <ul className="scan-result-foods-list">
            {result.foods.map((food, index) => (
              <li key={index} className="scan-result-food-item">
                {food}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Explanation */}
      {result.explanation && (
        <div className="scan-result-section">
          <h3 className="scan-result-section-title">Analysis</h3>
          <p className="scan-result-explanation">{result.explanation}</p>
        </div>
      )}

      {/* Safety During Flare */}
      {result.safetyDuringFlare && (
        <div className="scan-result-section">
          <div className="scan-result-safety">
            <ShieldIcon size={20} color={levelColor} />
            <div>
              <h4 className="scan-result-safety-label">During a Flare</h4>
              <p className="scan-result-safety-text">{result.safetyDuringFlare}</p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {result.riskFactors.length > 0 && (
        <div className="scan-result-section">
          <h3 className="scan-result-section-title">Risk Factors</h3>
          <ul className="scan-result-risk-list">
            {result.riskFactors.map((risk, index) => (
              <li key={index} className="scan-result-risk-item">
                <AlertIcon size={16} color="var(--color-danger, #ef4444)" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {result.benefits.length > 0 && (
        <div className="scan-result-section">
          <h3 className="scan-result-section-title">Benefits</h3>
          <ul className="scan-result-benefits-list">
            {result.benefits.map((benefit, index) => (
              <li key={index} className="scan-result-benefit-item">
                <CheckIcon size={16} color="var(--color-success, #22c55e)" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safer Alternatives */}
      {result.alternatives.length > 0 && (
        <div className="scan-result-section">
          <h3 className="scan-result-section-title">Safer Alternatives</h3>
          <ul className="scan-result-alternatives-list">
            {result.alternatives.map((alt, index) => (
              <li key={index} className="scan-result-alternative-item">
                {alt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add to Daily Log Button */}
      {onAddToLog && (
        <button
          className="scan-result-add-button"
          onClick={onAddToLog}
          type="button"
        >
          <PlusIcon size={20} />
          Add to Daily Log
        </button>
      )}
    </div>
  );
}
