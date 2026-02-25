import React from 'react';

interface Props {
  size?: number;
  color?: string;
  className?: string;
}

export default function ScanIcon({ size = 24, color = 'currentColor', className }: Props) {
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
      <path d="M2 7V2h5" />
      <path d="M17 2h5v5" />
      <path d="M22 17v5h-5" />
      <path d="M7 22H2v-5" />
    </svg>
  );
}
