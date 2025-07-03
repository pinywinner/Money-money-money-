import React, { useState, useMemo } from 'react';
import { useFinancial } from '../context/FinancialContext';
import NeumorphicCard from '../components/ui/NeumorphicCard';
import NeumorphicButton from '../components/ui/NeumorphicButton';
import InsightCard from '../components/ui/InsightCard';
import PredictionCard from '../components/ui/PredictionCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { FinancialAnalysisEngine } from '../utils/analysisEngine';
import { Brain, TrendingUp, AlertTriangle, Target, Zap, Eye, BarChart3, Activity, Lightbulb } from 'lucide-react';

const ExpenseAnalysis = () => {
  const { state } = useFinancial();
  const [viewType, setViewType] = useState<'pie' | 'bar' | 'line' | 'area'>('pie');
  const [analysisTab, setAnalysisTab] = useState<'overview' | 'insights' | 'predictions' | 'patterns'>('insights');

  // יצירת מנוע הניתוח
  const analysisEngine = useMemo(() => 
    new FinancialAnalysisEngine(state.transactions, state.categories, state.monthlyBudget, state.goals),
    [state.transactions, state.categories, state.monthlyBudget, state.goals]
  );

  // חישוב נתוני הוצאות
  const expenseData = useMemo(() => {
    return state.categories
      .filter(cat => cat.name !== 'הכנסה')
      .map(category => {
        const amount = state.transactions
          .filter(t => t.category === category.name && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          name: category.name,
          amount,
          color: category.color,
          budget: category.budget,
          percentage: category.budget > 0 ? (amount / category.budget) * 100 : 0
        };
      })
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [state.transactions, state.categories]);

  // נתונים למגמות חודשיות
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('he-IL', { month: 'short' });
      
      const monthlyExpenses = state.transactions
        .filter(t => t.type === 'expense' && 
                    t.date.getMonth() === date.getMonth() && 
                    t.date.getFullYear() === date.getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyIncome = state.transactions
        .filter(t => t.type === 'income' && 
                    t.date.getMonth() === date.getMonth() && 
                    t.date.getFullYear() === date.getFullYear())
        .reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        month: monthName,
        expenses: monthlyExpenses,
        income: monthlyIncome,
        balance: monthlyIncome - monthlyExpenses
      });
    }
    return data;
  }, [state.transactions]);

  // ניתוח תובנות
  const insights = useMemo(() => analysisEngine.generateActionableInsights(), [analysisEngine]);
  
  // תחזיות
  const cashFlowPrediction = useMemo(() => analysisEngine.predictCashFlow(), [analysisEngine]);
  
  // דפוסי הוצאות
  const spendingPatterns = useMemo(() => analysisEngine.analyzeSpendingPatterns(), [analysisEngine]);
  
  // זיהוי חריגות
  const anomalies = useMemo(() => analysisEngine.detectAnomalies(), [analysisEngine]);

  // הזדמנויות חיסכון
  const costReductionOpportunities = useMemo(() => 
    analysisEngine.analyzeCostReductionOpportunities(), [analysisEngine]
  );

  // נתוני גיימיפיקציה
  const gamificationData = useMemo(() => analysisEngine.generateGamificationData(), [analysisEngine]);

  const tabs = [
    { id: 'insights', label: 'תובנות AI', icon: <Brain className="w-5 h-5" />, count: insights.length },
    { id: 'overview', label: 'סקירה כללית', icon: <Eye className="w-5 h-5" />, count: expenseData.length },
    { id: 'predictions', label: 'תחזיות', icon: <Target className="w-5 h-5" />, count: 1 },
    { id: 'patterns', label: 'דפוסים וחריגות', icon: <Activity className="w-5 h-5" />, count: anomalies.length }
  ];

  const handleActionClick = (action: string) => {
    // כאן ניתן להוסיף לוגיקה לביצוע פעולות
    console.log('Action clicked:', action);
  };

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const highPriorityInsights = insights.filter(i => i.priority === 'high' || i.priority === 'critical').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with AI Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">מנוע ניתוח חכם</h1>
          <p className="text-gray-600">תובנות מתקדמות ופעולות מומלצות מבוססות בינה מלאכותית</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-neu">
          <Brain className="w-6 h-6" />
          <div className="text-sm">
            <div className="font-semibold">AI מופעל</div>
            <div className="opacity-90">{insights.length} תובנות זוהו</div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NeumorphicCard className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {totalExpenses.toLocaleString('he-IL')} ₪
              </div>
              <div className="text-sm text-gray-600">סה"כ הוצאות החודש</div>
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{insights.length}</div>
              <div className="text-sm text-gray-600">תובנות AI זמינות</div>
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-600"></div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{highPriorityInsights}</div>
              <div className="text-sm text-gray-600">תובנות בעדיפות גבוהה</div>
            </div>
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{costReductionOpportunities.length}</div>
              <div className="text-sm text-gray-600">הזדמנויות חיסכון</div>
            </div>
          </div>
        </NeumorphicCard>
      </div>

      {/* Enhanced Analysis Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setAnalysisTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all whitespace-nowrap relative ${
              analysisTab === tab.id
                ? 'shadow-inner-neu bg-blue-50 text-blue-600'
                : 'shadow-neu bg-gray-100 text-gray-600 hover:shadow-neu-hover'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                analysisTab === tab.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {analysisTab === 'insights' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
              <Brain className="w-7 h-7 text-blue-600" />
              תובנות חכמות ופעולות מומלצות
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg shadow-inner-neu">
              <AlertTriangle className="w-4 h-4" />
              <span>{highPriorityInsights} תובנות דורשות תשומת לב מיידית</span>
            </div>
          </div>

          {insights.length === 0 ? (
            <NeumorphicCard>
              <div className="text-center py-12">
                <Brain className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-3">
                  מנוע ה-AI מנתח את הנתונים שלך
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  המשך לעדכן עסקאות ולהגדיר תקציבים כדי לקבל תובנות מותאמות אישית ופעולות מומלצות
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </NeumorphicCard>
          ) : (
            <div className="space-y-6">
              {/* High Priority Insights */}
              {insights.filter(i => i.priority === 'critical' || i.priority === 'high').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    דורש תשומת לב מיידית
                  </h3>
                  <div className="space-y-4">
                    {insights
                      .filter(i => i.priority === 'critical' || i.priority === 'high')
                      .map(insight => (
                        <InsightCard
                          key={insight.id}
                          insight={insight}
                          onActionClick={handleActionClick}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Medium Priority Insights */}
              {insights.filter(i => i.priority === 'medium').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-700 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    הזדמנויות לשיפור
                  </h3>
                  <div className="space-y-4">
                    {insights
                      .filter(i => i.priority === 'medium')
                      .map(insight => (
                        <InsightCard
                          key={insight.id}
                          insight={insight}
                          onActionClick={handleActionClick}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Low Priority Insights */}
              {insights.filter(i => i.priority === 'low').length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    הישגים וטיפים
                  </h3>
                  <div className="space-y-4">
                    {insights
                      .filter(i => i.priority === 'low')
                      .map(insight => (
                        <InsightCard
                          key={insight.id}
                          insight={insight}
                          onActionClick={handleActionClick}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* Cost Reduction Opportunities */}
              {costReductionOpportunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    הזדמנויות חיסכון נוספות
                  </h3>
                  <div className="space-y-4">
                    {costReductionOpportunities.map(opportunity => (
                      <InsightCard
                        key={opportunity.id}
                        insight={opportunity}
                        onActionClick={handleActionClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {analysisTab === 'overview' && (
        <div className="space-y-6">
          {/* Chart Controls */}
          <NeumorphicCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                התפלגות הוצאות לפי קטגוריות
              </h2>
              <div className="flex gap-2">
                {[
                  { type: 'pie', label: 'עוגה', icon: '🥧' },
                  { type: 'bar', label: 'עמודות', icon: '📊' },
                  { type: 'line', label: 'קו', icon: '📈' },
                  { type: 'area', label: 'אזור', icon: '🏔️' }
                ].map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => setViewType(type as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm ${
                      viewType === type 
                        ? 'shadow-inner-neu bg-blue-50 text-blue-600' 
                        : 'shadow-neu bg-gray-100 text-gray-600 hover:shadow-neu-hover'
                    }`}
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {viewType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString('he-IL')} ₪`} />
                  </PieChart>
                ) : viewType === 'bar' ? (
                  <BarChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString('he-IL')} ₪`} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : viewType === 'line' ? (
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString('he-IL')} ₪`} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="הוצאות" />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="הכנסות" />
                  </LineChart>
                ) : (
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toLocaleString('he-IL')} ₪`} />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="הכנסות" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="הוצאות" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </NeumorphicCard>

          {/* Enhanced Category Details */}
          <NeumorphicCard>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              פירוט מתקדם לפי קטגוריות
            </h2>
            
            <div className="space-y-4">
              {expenseData.map((item, index) => (
                <div key={item.name} className="p-5 bg-gray-50 rounded-xl shadow-inner-neu">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                          {index + 1}
                        </div>
                        <div 
                          className="w-6 h-6 rounded-full shadow-neu" 
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">{item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.amount.toLocaleString('he-IL')} ₪ מתוך {item.budget.toLocaleString('he-IL')} ₪
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className={`text-xl font-bold ${
                        item.percentage > 90 ? 'text-red-600' : 
                        item.percentage > 75 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.budget > item.amount ? 
                          `נותרו ${(item.budget - item.amount).toLocaleString('he-IL')} ₪` : 
                          `חריגה של ${(item.amount - item.budget).toLocaleString('he-IL')} ₪`
                        }
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative h-3 bg-gray-200 rounded-full shadow-inner-neu overflow-hidden">
                    <div
                      className="absolute top-0 right-0 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(item.percentage, 100)}%`,
                        backgroundColor: item.percentage > 90 ? '#ef4444' : 
                                       item.percentage > 75 ? '#f59e0b' : '#10b981',
                        boxShadow: `0 0 8px ${item.percentage > 90 ? '#ef444440' : 
                                             item.percentage > 75 ? '#f59e0b40' : '#10b98140'}`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        </div>
      )}

      {analysisTab === 'predictions' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
            <Target className="w-7 h-7 text-purple-600" />
            תחזיות פיננסיות מתקדמות
          </h2>

          <PredictionCard prediction={cashFlowPrediction} />

          {/* Additional predictions placeholder */}
          <NeumorphicCard>
            <div className="text-center py-12">
              <Target className="w-20 h-20 text-purple-500 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                תחזיות נוספות בפיתוח
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                בקרוב: תחזיות השגת יעדים, זיהוי מגמות עונתיות, חיזוי הוצאות חריגות ועוד
              </p>
              <div className="flex items-center justify-center gap-4">
                <NeumorphicButton variant="primary">
                  הודע לי כשיהיה מוכן
                </NeumorphicButton>
                <NeumorphicButton variant="secondary">
                  בקש תחזית מותאמת
                </NeumorphicButton>
              </div>
            </div>
          </NeumorphicCard>
        </div>
      )}

      {analysisTab === 'patterns' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
            <Activity className="w-7 h-7 text-orange-600" />
            דפוסי הוצאות וחריגות
          </h2>

          {/* Spending Patterns */}
          <NeumorphicCard>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              דפוסי הוצאות מזוהים
            </h3>
            <div className="space-y-4">
              {spendingPatterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl shadow-inner-neu">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">{pattern.category}</div>
                      <div className="text-sm text-gray-600">
                        תדירות: {pattern.frequency === 'daily' ? 'יומי' : 
                                 pattern.frequency === 'weekly' ? 'שבועי' : 
                                 pattern.frequency === 'monthly' ? 'חודשי' : 'לא סדיר'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        צפיות: {Math.round(pattern.predictability * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800 text-lg">
                      {pattern.averageAmount.toLocaleString('he-IL')} ₪
                    </div>
                    <div className={`text-sm font-medium flex items-center gap-1 ${
                      pattern.trend === 'increasing' ? 'text-red-600' :
                      pattern.trend === 'decreasing' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {pattern.trend === 'increasing' ? '↗ עולה' :
                       pattern.trend === 'decreasing' ? '↘ יורד' : '→ יציב'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeumorphicCard>

          {/* Anomalies */}
          {anomalies.length > 0 && (
            <NeumorphicCard>
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                חריגות זוהו ({anomalies.length})
              </h3>
              <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                  <div key={index} className="p-5 bg-red-50 rounded-xl shadow-inner-neu border-r-4 border-r-red-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-red-800 mb-2">{anomaly.description}</div>
                        <div className="text-sm text-red-600 mb-3">{anomaly.suggestedAction}</div>
                        <div className="text-xs text-red-500">
                          סוג חריגה: {anomaly.anomalyType === 'amount' ? 'סכום' : 
                                     anomaly.anomalyType === 'frequency' ? 'תדירות' : 
                                     anomaly.anomalyType === 'category' ? 'קטגוריה' : 'זמן'}
                        </div>
                      </div>
                      <div className="text-left ml-4">
                        <div className="text-sm text-red-600 mb-2">רמת חומרה</div>
                        <div className="flex items-center gap-1">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < anomaly.severity ? 'bg-red-500' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-red-500 mt-1">
                          {anomaly.severity}/10
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NeumorphicCard>
          )}

          {/* Educational Tips */}
          {gamificationData.educationalTips && gamificationData.educationalTips.length > 0 && (
            <NeumorphicCard>
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                טיפים חינוכיים מותאמים אישית
              </h3>
              <div className="space-y-3">
                {gamificationData.educationalTips.map((tip: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg shadow-inner-neu">
                    <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-yellow-700" />
                    </div>
                    <p className="text-sm text-yellow-800">{tip}</p>
                  </div>
                ))}
              </div>
            </NeumorphicCard>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseAnalysis;