import React from 'react';

interface Props {
  size?: number;
  color?: string;
  className?: string;
}

export default function CrownIcon({ size = 24, color = 'currentColor', className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <line x1="2" y1="21" x2="22" y2="21" />
    </svg>
  );
}
