import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function PillIcon({ size = 24, color, className }: IconProps) {
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
      <path d="M8.5 2.8L2.8 8.5C1.07 10.23 1.07 13.03 2.8 14.76L9.24 21.2C10.97 22.93 13.77 22.93 15.5 21.2L21.2 15.5C22.93 13.77 22.93 10.97 21.2 9.24L14.76 2.8C13.03 1.07 10.23 1.07 8.5 2.8Z" />
      <line x1="6.05" y1="11.63" x2="12.37" y2="17.95" />
    </svg>
  );
}
