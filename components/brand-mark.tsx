"use client";

import React, { useId } from "react";

type BrandMarkProps = {
  size?: number;
  className?: string;
};

function BrandMark({ size = 36, className }: BrandMarkProps) {
  const id = useId();
  const bgId = `${id}-bg`;
  const shineId = `${id}-shine`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="GaweQR"
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#19C2A0" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>
        <linearGradient id={shineId} x1="32" y1="0" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0.18" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="64" height="64" rx="16" fill={`url(#${bgId})`} />
      <rect width="64" height="64" rx="16" fill={`url(#${shineId})`} />

      <rect x="11.5" y="11.5" width="15" height="15" rx="5" stroke="white" strokeWidth="3" />
      <rect x="16.5" y="16.5" width="5" height="5" rx="1.5" fill="white" />

      <rect x="37.5" y="11.5" width="15" height="15" rx="5" stroke="white" strokeWidth="3" />
      <rect x="42.5" y="16.5" width="5" height="5" rx="1.5" fill="white" />

      <rect x="11.5" y="37.5" width="15" height="15" rx="5" stroke="white" strokeWidth="3" />
      <rect x="16.5" y="42.5" width="5" height="5" rx="1.5" fill="white" />

      <rect x="37" y="37" width="6" height="6" rx="2" fill="white" />
      <rect x="47" y="37" width="6" height="6" rx="2" fill="white" fillOpacity="0.7" />
      <rect x="42" y="42" width="6" height="6" rx="2" fill="white" />
      <rect x="37" y="47" width="6" height="6" rx="2" fill="white" fillOpacity="0.7" />
      <rect x="47" y="47" width="6" height="6" rx="2" fill="white" />
    </svg>
  );
}

export default BrandMark;
