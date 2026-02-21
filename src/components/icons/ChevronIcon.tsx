import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export default function ChevronIcon({ size = 24, color, className, direction = 'right' }: IconProps) {
  const rotations: Record<string, string> = {
    right: '0',
    down: '90',
    left: '180',
    up: '270',
  };

  const rotation = rotations[direction];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
