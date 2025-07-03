import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import NeumorphicCard from '../components/ui/NeumorphicCard';
import Speedometer from '../components/ui/Speedometer';
import FuelGauge from '../components/ui/FuelGauge';
import GoalCard from '../components/ui/GoalCard';
import PitStopMessage from '../components/ui/PitStopMessage';
import { 
  Home, 
  UtensilsCrossed, 
  Car, 
  PartyPopper, 
  Heart, 
  GraduationCap,
  Shield,
  Plane
} from 'lucide-react';

const Dashboard = () => {
  const { state } = useFinancial();

  // Calculate current month expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = state.transactions
    .filter(t => t.type === 'expense' && 
                t.date.getMonth() === currentMonth && 
                t.date.getFullYear() === currentYear)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate category usage
  const categoryUsage = state.categories
    .filter(c => c.name !== 'הכנסה')
    .map(category => {
      const used = state.transactions
        .filter(t => t.category === category.name && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...category, used };
    });

  const iconMap: { [key: string]: React.ReactNode } = {
    'דיור': <Home size={20} />,
    'מזון': <UtensilsCrossed size={20} />,
    'תחבורה': <Car size={20} />,
    'בילויים': <PartyPopper size={20} />,
    'בריאות': <Heart size={20} />,
    'חינוך': <GraduationCap size={20} />,
    'קרן חירום': <Shield size={20} />,
    'חופשה': <Plane size={20} />
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          הקוקפיט הכלכלי
        </h1>
        <p className="text-gray-600">
          הנהיגה הפיננסית שלך במבט אחד
        </p>
      </div>

      {/* Main Speedometer */}
      <NeumorphicCard className="flex justify-center">
        <Speedometer
          value={monthlyExpenses}
          max={state.monthlyBudget}
          label="הוצאות חודשיות"
          size="large"
        />
      </NeumorphicCard>

      {/* Fuel Gauges */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          מדי דלק - קטגוריות הוצאות
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryUsage.map(category => (
            <FuelGauge
              key={category.id}
              label={category.name}
              used={category.used}
              total={category.budget}
              color={category.color}
              icon={iconMap[category.name]}
            />
          ))}
        </div>
      </div>

      {/* Financial Goals */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          יעדים פיננסיים
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>

      {/* Pit Stop Messages */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          הודעות פיט סטופ
        </h2>
        <div className="space-y-3">
          {state.pitStopMessages.slice(0, 3).map((message, index) => (
            <PitStopMessage
              key={index}
              message={message}
              type={index === 0 ? 'success' : index === 1 ? 'warning' : 'info'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;