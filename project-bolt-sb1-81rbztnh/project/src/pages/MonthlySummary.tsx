import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import NeumorphicCard from '../components/ui/NeumorphicCard';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar } from 'lucide-react';

const MonthlySummary = () => {
  const { state } = useFinancial();

  // Calculate current month data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthName = new Date().toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });

  const currentMonthTransactions = state.transactions.filter(t => 
    t.date.getMonth() === currentMonth && t.date.getFullYear() === currentYear
  );

  const income = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;

  // Calculate previous month for comparison
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const prevMonthTransactions = state.transactions.filter(t => 
    t.date.getMonth() === prevMonth && t.date.getFullYear() === prevYear
  );

  const prevIncome = prevMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const prevExpenses = prevMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
  const expenseChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;

  // Get performance message
  const getPerformanceMessage = () => {
    if (savingsRate >= 20) {
      return {
        message: "נהיגה מצוינת! אתם בדרך הנכונה למטרות הפיננסיות שלכם",
        type: "excellent" as const,
        icon: <Target className="w-6 h-6 text-green-500" />
      };
    } else if (savingsRate >= 10) {
      return {
        message: "נהיגה טובה! יש מקום לשיפור בחיסכון",
        type: "good" as const,
        icon: <TrendingUp className="w-6 h-6 text-blue-500" />
      };
    } else if (savingsRate >= 0) {
      return {
        message: "נהיגה זהירה! מומלץ לבדוק את ההוצאות",
        type: "caution" as const,
        icon: <Calendar className="w-6 h-6 text-yellow-500" />
      };
    } else {
      return {
        message: "זיהינו חריגה! עצרו לפיט סטופ ובדקו את התקציב",
        type: "warning" as const,
        icon: <TrendingDown className="w-6 h-6 text-red-500" />
      };
    }
  };

  const performance = getPerformanceMessage();

  // Top categories this month
  const topCategories = state.categories
    .filter(cat => cat.name !== 'הכנסה')
    .map(category => {
      const amount = currentMonthTransactions
        .filter(t => t.category === category.name && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...category, amount };
    })
    .filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          סיכום חודשי
        </h1>
        <p className="text-gray-600">{currentMonthName}</p>
      </div>

      {/* Performance Summary */}
      <NeumorphicCard>
        <div className="flex items-center gap-4 mb-4">
          {performance.icon}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              דוח ביצועים
            </h2>
            <p className="text-gray-600">{performance.message}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg shadow-inner-neu">
            <div className="text-2xl font-bold text-blue-600">
              {savingsRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">שיעור חיסכון</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg shadow-inner-neu">
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance.toLocaleString('he-IL')} ₪
            </div>
            <div className="text-sm text-gray-600">יתרה חודשית</div>
          </div>
        </div>
      </NeumorphicCard>

      {/* Income vs Expenses */}
      <NeumorphicCard>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          הכנסות מול הוצאות
        </h2>
        
        <div className="space-y-4">
          {/* Income */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg shadow-inner-neu">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-green-800">הכנסות</div>
                <div className="text-sm text-green-600">
                  {incomeChange !== 0 && (
                    <>
                      {incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(1)}% מהחודש הקודם
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-green-600">
              {income.toLocaleString('he-IL')} ₪
            </div>
          </div>

          {/* Expenses */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg shadow-inner-neu">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <div>
                <div className="font-medium text-red-800">הוצאות</div>
                <div className="text-sm text-red-600">
                  {expenseChange !== 0 && (
                    <>
                      {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}% מהחודש הקודם
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-red-600">
              {expenses.toLocaleString('he-IL')} ₪
            </div>
          </div>

          {/* Balance Bar */}
          <div className="relative">
            <div className="h-8 bg-gray-200 rounded-full shadow-inner-neu overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, (income / (income + expenses)) * 100))}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-800">
                {income > 0 ? `${((income / (income + expenses)) * 100).toFixed(1)}% הכנסות` : 'אין הכנסות'}
              </span>
            </div>
          </div>
        </div>
      </NeumorphicCard>

      {/* Top Categories */}
      <NeumorphicCard>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          הקטגוריות המובילות
        </h2>
        
        <div className="space-y-3">
          {topCategories.map((category, index) => (
            <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-inner-neu">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                  {index + 1}
                </div>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <div className="font-medium text-gray-800">{category.name}</div>
                  <div className="text-sm text-gray-600">
                    {((category.amount / category.budget) * 100).toFixed(1)}% מהתקציב
                  </div>
                </div>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-800">
                  {category.amount.toLocaleString('he-IL')} ₪
                </div>
                <div className="text-sm text-gray-600">
                  מתוך {category.budget.toLocaleString('he-IL')} ₪
                </div>
              </div>
            </div>
          ))}
        </div>
      </NeumorphicCard>

      {/* Goals Progress */}
      <NeumorphicCard>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          התקדמות יעדים
        </h2>
        
        <div className="space-y-3">
          {state.goals.map(goal => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <div key={goal.id} className="p-4 bg-gray-50 rounded-lg shadow-inner-neu">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-800">{goal.title}</div>
                  <div className="text-sm text-gray-600">
                    {progress.toFixed(1)}%
                  </div>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute top-0 right-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{goal.current.toLocaleString('he-IL')} ₪</span>
                  <span>{goal.target.toLocaleString('he-IL')} ₪</span>
                </div>
              </div>
            );
          })}
        </div>
      </NeumorphicCard>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NeumorphicCard>
          <div className="text-center">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-800">
              {currentMonthTransactions.length}
            </div>
            <div className="text-sm text-gray-600">עסקאות</div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard>
          <div className="text-center">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-800">
              {expenses > 0 ? (income / expenses).toFixed(1) : '∞'}
            </div>
            <div className="text-sm text-gray-600">יחס הכנסה/הוצאה</div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard>
          <div className="text-center">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-800">
              {Math.round(expenses / 30)}
            </div>
            <div className="text-sm text-gray-600">הוצאה יומית ממוצעת</div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard>
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-800">
              {topCategories.length > 0 ? topCategories[0].name : 'אין'}
            </div>
            <div className="text-sm text-gray-600">קטגוריה מובילה</div>
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};

export default MonthlySummary;