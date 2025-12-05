import React from 'react';

interface ArchiveBoxIconProps {
  size?: number;
  className?: string;
}

const ArchiveBoxIcon: React.FC<ArchiveBoxIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Box lid */}
      <rect x="3" y="3" width="18" height="5" rx="1" />
      {/* Box body */}
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      {/* Label on box */}
      <rect x="9" y="12" width="6" height="3" rx="0.5" />
    </svg>
  );
};

export default ArchiveBoxIcon;
