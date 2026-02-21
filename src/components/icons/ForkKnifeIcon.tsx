import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ForkKnifeIcon({ size = 24, color, className }: IconProps) {
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
      {/* Fork */}
      <path d="M7 2V9C7 10.1 7.9 11 9 11H9.5V22" />
      <path d="M7 2C7 2 5 3.5 5 6.5C5 8.5 6 10 7 11" />
      <path d="M12 2V9C12 10.1 11.1 11 10 11" />
      {/* Knife */}
      <path d="M17 2V22" />
      <path d="M17 2C17 2 20 3 20 7C20 9 18.5 10 17 10" />
    </svg>
  );
}
