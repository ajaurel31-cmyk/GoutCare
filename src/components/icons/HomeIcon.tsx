import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function HomeIcon({ size = 24, color, className }: IconProps) {
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
      <path d="M3 9.5L12 2L21 9.5V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9.5Z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
