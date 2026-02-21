import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function CrownIcon({ size = 24, color, className }: IconProps) {
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
      <path d="M2 8L6.5 13L12 4L17.5 13L22 8L20 20H4L2 8Z" />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}
