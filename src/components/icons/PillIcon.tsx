import React from 'react';

interface Props {
  size?: number;
  color?: string;
  className?: string;
}

export default function PillIcon({ size = 24, color = 'currentColor', className }: Props) {
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
      <path d="M10.5 1.5l-8 8a4.95 4.95 0 1 0 7 7l8-8a4.95 4.95 0 0 0-7-7z" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
    </svg>
  );
}
