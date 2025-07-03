import React from 'react';
import { Goal } from '../../context/FinancialContext';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface GoalCardProps {
  goal: Goal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  const remaining = Math.max(goal.target - goal.current, 0);
  
  return (
    <div className="shadow-neu bg-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full shadow-inner-neu bg-gray-50 flex items-center justify-center text-blue-600">
            {goal.icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{goal.title}</h3>
            <p className="text-sm text-gray-600">
              יעד: {format(goal.deadline, 'dd/MM/yyyy', { locale: he })}
            </p>
          </div>
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-800">
            {goal.current.toLocaleString('he-IL')} ₪
          </div>
          <div className="text-xs text-gray-500">
            מתוך {goal.target.toLocaleString('he-IL')} ₪
          </div>
        </div>
      </div>
      
      <div className="relative h-3 bg-gray-200 rounded-full shadow-inner-neu mb-2">
        <div
          className="absolute top-0 right-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: '#3b82f6',
            boxShadow: '0 0 6px #3b82f640',
            background: 'linear-gradient(90deg, #3b82f680, #3b82f6)'
          }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-600">
        <span>{percentage.toFixed(1)}% הושג</span>
        <span>נותרו: {remaining.toLocaleString('he-IL')} ₪</span>
      </div>
    </div>
  );
};

export default GoalCard;