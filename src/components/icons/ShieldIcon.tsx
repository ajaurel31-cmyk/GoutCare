import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ShieldIcon({ size = 24, color, className }: IconProps) {
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
      <path d="M12 2L3.5 6.5V11.5C3.5 16.45 7.16 21.07 12 22C16.84 21.07 20.5 16.45 20.5 11.5V6.5L12 2Z" />
      <path d="M9 12L11 14L15 10" />
    </svg>
  );
}
