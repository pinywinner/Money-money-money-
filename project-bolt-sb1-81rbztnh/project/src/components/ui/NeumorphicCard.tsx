import React, { ReactNode } from 'react';

interface NeumorphicCardProps {
  children: ReactNode;
  className?: string;
  pressed?: boolean;
  onClick?: () => void;
}

const NeumorphicCard: React.FC<NeumorphicCardProps> = ({ 
  children, 
  className = '', 
  pressed = false, 
  onClick 
}) => {
  const baseStyles = pressed
    ? 'shadow-inner-neu bg-gray-50'
    : 'shadow-neu bg-gray-100 hover:shadow-neu-hover';

  return (
    <div
      className={`${baseStyles} rounded-2xl p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default NeumorphicCard;