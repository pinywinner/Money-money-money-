import React from 'react';

interface FuelGaugeProps {
  label: string;
  used: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}

const FuelGauge: React.FC<FuelGaugeProps> = ({ 
  label, 
  used, 
  total, 
  color, 
  icon 
}) => {
  const percentage = Math.min((used / total) * 100, 100);
  const remaining = Math.max(total - used, 0);
  
  const getStatusColor = () => {
    if (percentage <= 60) return '#10b981';
    if (percentage <= 85) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="shadow-neu bg-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full shadow-inner-neu bg-gray-50 flex items-center justify-center text-gray-600">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{label}</h3>
            <p className="text-sm text-gray-600">
              נותרו: {remaining.toLocaleString('he-IL')} ₪
            </p>
          </div>
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-800">
            {used.toLocaleString('he-IL')} / {total.toLocaleString('he-IL')} ₪
          </div>
          <div className="text-xs text-gray-500">
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
      
      <div className="relative h-3 bg-gray-200 rounded-full shadow-inner-neu">
        <div
          className="absolute top-0 right-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: getStatusColor(),
            boxShadow: `0 0 6px ${getStatusColor()}40`,
            background: `linear-gradient(90deg, ${getStatusColor()}80, ${getStatusColor()})`
          }}
        />
      </div>
    </div>
  );
};

export default FuelGauge;