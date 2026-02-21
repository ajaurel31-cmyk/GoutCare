import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function FlameIcon({ size = 24, color, className }: IconProps) {
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
      <path d="M12 22C16.418 22 20 18.418 20 14C20 10 17 7.5 15 5.5C14.5 8 13 9 12 9C11 9 10.5 7 10.5 5C10.5 4 10 2 8 2C8 4 7 6 5.5 8C4 10 4 12.5 4 14C4 18.418 7.582 22 12 22Z" />
      <path d="M12 22C14.21 22 16 20.21 16 18C16 16 14.5 14.5 13.5 13.5C13.25 14.75 12.5 15.25 12 15.25C11.5 15.25 11.25 14.5 11.25 13.5C11 12.5 10.5 12 9.5 11C9 12 8 13 8 15C8 18.5 9.79 22 12 22Z" />
    </svg>
  );
}
