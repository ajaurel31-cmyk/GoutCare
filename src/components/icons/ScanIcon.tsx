import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ScanIcon({ size = 24, color, className }: IconProps) {
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
      <path d="M3 7V5C3 3.9 3.9 3 5 3H7" />
      <path d="M17 3H19C20.1 3 21 3.9 21 5V7" />
      <path d="M21 17V19C21 20.1 20.1 21 19 21H17" />
      <path d="M7 21H5C3.9 21 3 20.1 3 19V17" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}
