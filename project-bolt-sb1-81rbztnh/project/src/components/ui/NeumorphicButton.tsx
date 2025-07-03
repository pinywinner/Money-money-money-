import React, { ReactNode, useState } from 'react';

interface NeumorphicButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary'
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const variantStyles = {
    primary: 'text-blue-600 hover:text-blue-700',
    secondary: 'text-gray-600 hover:text-gray-700',
    success: 'text-green-600 hover:text-green-700',
    warning: 'text-yellow-600 hover:text-yellow-700',
    danger: 'text-red-600 hover:text-red-700'
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <button
      className={`
        ${isPressed ? 'shadow-inner-neu' : 'shadow-neu hover:shadow-neu-hover'}
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:shadow-inner-neu'}
        bg-gray-100 rounded-xl px-6 py-3 font-medium transition-all duration-150
        ${className}
      `}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default NeumorphicButton;