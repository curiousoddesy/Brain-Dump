
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`${className} rounded-lg shadow-sm overflow-hidden transition-all duration-500`}>
      <img
        src="/logo.png"
        alt="Brain Dump Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Logo;
