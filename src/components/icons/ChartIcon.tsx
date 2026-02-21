import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ChartIcon({ size = 24, color, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 12 18 8 13 13 9 9 2 16" />
      <polyline points="22 6 22 12 16 12" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
