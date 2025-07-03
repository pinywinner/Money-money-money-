import React from 'react';
import { AlertTriangle, CheckCircle, Info, TrendingUp } from 'lucide-react';

interface PitStopMessageProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'achievement';
}

const PitStopMessage: React.FC<PitStopMessageProps> = ({ 
  message, 
  type = 'info' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'achievement':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-r-green-500';
      case 'warning':
        return 'border-r-yellow-500';
      case 'achievement':
        return 'border-r-blue-500';
      default:
        return 'border-r-blue-500';
    }
  };

  return (
    <div className={`shadow-neu bg-gray-100 rounded-xl p-4 border-r-4 ${getBorderColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm text-gray-800">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default PitStopMessage;