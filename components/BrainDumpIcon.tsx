import React from 'react';

interface BrainDumpIconProps {
  size?: number;
  className?: string;
}

const BrainDumpIcon: React.FC<BrainDumpIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Brain left side - wavy curves */}
      <path d="M4 12c0-2.5 1.5-4.5 3.5-5.5C6.5 5 6 3.5 7 2c1.5 0 2.5 1 3 2c.5-1 1.5-2 3-2c1 1.5.5 3-.5 4.5C14.5 7.5 16 9.5 16 12" />
      <path d="M4 12c0 2.5 1.5 4.5 3.5 5.5C6.5 19 6 20.5 7 22c1.5 0 2.5-1 3-2c.5 1 1.5 2 3 2c1-1.5.5-3-.5-4.5C14.5 16.5 16 14.5 16 12" />
      
      {/* Circuit connections on right side */}
      <path d="M16 8h4" />
      <path d="M16 12h2" />
      <path d="M16 16h4" />
      
      {/* Circuit nodes */}
      <circle cx="20" cy="8" r="1" fill="currentColor" />
      <circle cx="18" cy="12" r="1" fill="currentColor" />
      <circle cx="20" cy="16" r="1" fill="currentColor" />
      
      {/* Vertical connector */}
      <path d="M20 9v6" />
    </svg>
  );
};

export default BrainDumpIcon;
