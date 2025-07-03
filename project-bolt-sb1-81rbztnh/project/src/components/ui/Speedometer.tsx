import React from 'react';

interface SpeedometerProps {
  value: number;
  max: number;
  label: string;
  size?: 'small' | 'medium' | 'large';
}

const Speedometer: React.FC<SpeedometerProps> = ({ 
  value, 
  max, 
  label, 
  size = 'medium' 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const angle = (percentage / 100) * 180 - 90;
  
  const sizes = {
    small: { width: 120, height: 120, strokeWidth: 8 },
    medium: { width: 200, height: 200, strokeWidth: 12 },
    large: { width: 280, height: 280, strokeWidth: 16 }
  };

  const { width, height, strokeWidth } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = Math.PI * radius;

  const getColor = () => {
    if (percentage <= 60) return '#10b981'; // Green
    if (percentage <= 85) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <svg width={width} height={height / 2 + 20} className="transform -rotate-90">
          {/* Background arc */}
          <path
            d={`M ${strokeWidth/2} ${height/2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth/2} ${height/2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth/2} ${height/2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth/2} ${height/2}`}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * percentage / 100)}
            style={{
              filter: `drop-shadow(0 0 6px ${getColor()}40)`,
              transition: 'stroke-dashoffset 0.5s ease-in-out'
            }}
          />
        </svg>
        
        {/* Needle */}
        <div
          className="absolute top-1/2 left-1/2 w-1 bg-gray-800 origin-bottom transform -translate-x-1/2 transition-transform duration-500"
          style={{
            height: radius * 0.8,
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
            transformOrigin: 'bottom center'
          }}
        >
          <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-gray-800 rounded-full transform -translate-x-1/2"></div>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <div className="text-2xl font-bold text-gray-800">
          {value.toLocaleString('he-IL')} ₪
        </div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-xs text-gray-500 mt-1">
          {percentage.toFixed(1)}% מהתקציב
        </div>
      </div>
    </div>
  );
};

export default Speedometer;