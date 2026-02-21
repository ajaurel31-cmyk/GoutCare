import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function DropletIcon({ size = 24, color, className }: IconProps) {
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
      <path d="M12 2.69L17.66 8.35C18.84 9.53 19.56 10.96 19.82 12.48C20.08 14 19.87 15.56 19.21 16.95C18.55 18.33 17.48 19.48 16.14 20.24C14.81 21 13.27 21.34 11.74 21.2C10.2 21.07 8.75 20.47 7.56 19.48C6.37 18.49 5.5 17.16 5.07 15.67C4.64 14.18 4.66 12.6 5.14 11.12C5.62 9.65 6.53 8.35 7.75 7.39L12 2.69Z" />
    </svg>
  );
}
