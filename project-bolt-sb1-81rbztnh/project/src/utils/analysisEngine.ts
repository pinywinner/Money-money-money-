export interface AnalysisInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  impact: number; // 1-10 scale
  confidence: number; // 0-1 scale
  metadata?: Record<string, any>;
}

export interface SpendingPattern {
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
  averageAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality?: string;
  predictability: number; // 0-1 scale
}

export interface AnomalyDetection {
  transactionId: string;
  anomalyType: 'amount' | 'frequency' | 'category' | 'timing';
  severity: number; // 1-10 scale
  description: string;
  suggestedAction: string;
}

export interface PredictiveInsight {
  type: 'cash_flow' | 'budget_breach' | 'goal_achievement' | 'lifestyle_creep';
  prediction: string;
  confidence: number;
  timeframe: string;
  recommendedActions: string[];
}

export class FinancialAnalysisEngine {
  private transactions: any[];
  private categories: any[];
  private monthlyBudget: number;
  private goals: any[];

  constructor(transactions: any[], categories: any[], monthlyBudget: number, goals: any[]) {
    this.transactions = transactions;
    this.categories = categories;
    this.monthlyBudget = monthlyBudget;
    this.goals = goals;
  }

  // 1. סיווג הוצאות אוטומטי ולמידה
  categorizeTransaction(description: string, amount: number): { category: string; confidence: number } {
    const keywords = {
      'דיור': ['שכר דירה', 'משכנתא', 'ארנונה', 'חשמל', 'מים', 'גז', 'ועד בית', 'תחזוקה'],
      'מזון': ['סופר', 'קניות', 'מכולת', 'שוק', 'רמי לוי', 'שופרסל', 'מגה', 'טיב טעם'],
      'תחבורה': ['דלק', 'בנזין', 'חניה', 'רב קו', 'מוניות', 'גט', 'אובר', 'ביטוח רכב'],
      'בילויים': ['מסעדה', 'קפה', 'קולנוע', 'תיאטרון', 'בר', 'פאב', 'בידור'],
      'בריאות': ['רופא', 'רוקח', 'בית מרקחת', 'ביטוח בריאות', 'מכבי', 'כללית', 'לאומית'],
      'חינוך': ['לימודים', 'ספרים', 'קורסים', 'גן ילדים', 'בית ספר', 'אוניברסיטה']
    };

    let bestMatch = { category: 'אחר', confidence: 0 };

    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      const matches = categoryKeywords.filter(keyword => 
        description.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matches.length > 0) {
        const confidence = matches.length / categoryKeywords.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = { category, confidence };
        }
      }
    }

    // אם לא נמצא התאמה טובה, נשתמש בהיסטוריה
    if (bestMatch.confidence < 0.3) {
      const historicalMatch = this.findHistoricalPattern(description, amount);
      if (historicalMatch.confidence > bestMatch.confidence) {
        bestMatch = historicalMatch;
      }
    }

    return bestMatch;
  }

  private findHistoricalPattern(description: string, amount: number): { category: string; confidence: number } {
    const similarTransactions = this.transactions.filter(t => {
      const descSimilarity = this.calculateStringSimilarity(t.description, description);
      const amountSimilarity = 1 - Math.abs(t.amount - amount) / Math.max(t.amount, amount);
      return descSimilarity > 0.6 || amountSimilarity > 0.8;
    });

    if (similarTransactions.length === 0) {
      return { category: 'אחר', confidence: 0 };
    }

    const categoryCount = similarTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommon = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      category: mostCommon[0],
      confidence: mostCommon[1] / similarTransactions.length
    };
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  // 2. ניתוח דפוסים, מגמות וחריגות
  analyzeSpendingPatterns(): SpendingPattern[] {
    const patterns: SpendingPattern[] = [];

    this.categories.forEach(category => {
      const categoryTransactions = this.transactions.filter(t => 
        t.category === category.name && t.type === 'expense'
      );

      if (categoryTransactions.length === 0) return;

      const amounts = categoryTransactions.map(t => t.amount);
      const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;

      // חישוב תדירות
      const frequency = this.calculateFrequency(categoryTransactions);
      
      // חישוב מגמה
      const trend = this.calculateTrend(categoryTransactions);
      
      // חישוב צפיות
      const predictability = this.calculatePredictability(categoryTransactions);

      patterns.push({
        category: category.name,
        frequency,
        averageAmount,
        trend,
        predictability
      });
    });

    return patterns;
  }

  private calculateFrequency(transactions: any[]): 'daily' | 'weekly' | 'monthly' | 'irregular' {
    if (transactions.length < 2) return 'irregular';

    const intervals = [];
    for (let i = 1; i < transactions.length; i++) {
      const diff = Math.abs(transactions[i].date.getTime() - transactions[i-1].date.getTime());
      intervals.push(diff / (1000 * 60 * 60 * 24)); // ימים
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    if (avgInterval <= 2) return 'daily';
    if (avgInterval <= 10) return 'weekly';
    if (avgInterval <= 35) return 'monthly';
    return 'irregular';
  }

  private calculateTrend(transactions: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (transactions.length < 3) return 'stable';

    const sortedTransactions = transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstHalf = sortedTransactions.slice(0, Math.floor(sortedTransactions.length / 2));
    const secondHalf = sortedTransactions.slice(Math.floor(sortedTransactions.length / 2));

    const firstAvg = firstHalf.reduce((sum, t) => sum + t.amount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + t.amount, 0) / secondHalf.length;

    const changePercent = (secondAvg - firstAvg) / firstAvg;

    if (changePercent > 0.1) return 'increasing';
    if (changePercent < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculatePredictability(transactions: any[]): number {
    if (transactions.length < 3) return 0;

    const amounts = transactions.map(t => t.amount);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    // ככל שהסטיית התקן נמוכה יותר, הצפיות גבוהה יותר
    return Math.max(0, 1 - (stdDev / mean));
  }

  // זיהוי חריגות
  detectAnomalies(): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    this.categories.forEach(category => {
      const categoryTransactions = this.transactions.filter(t => 
        t.category === category.name && t.type === 'expense'
      );

      if (categoryTransactions.length < 3) return;

      const amounts = categoryTransactions.map(t => t.amount);
      const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const stdDev = Math.sqrt(
        amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length
      );

      categoryTransactions.forEach(transaction => {
        const zScore = Math.abs((transaction.amount - mean) / stdDev);
        
        if (zScore > 2) { // חריגה של יותר מ-2 סטיות תקן
          anomalies.push({
            transactionId: transaction.id,
            anomalyType: 'amount',
            severity: Math.min(10, Math.floor(zScore)),
            description: `הוצאה חריגה בקטגוריית ${category.name}: ${transaction.amount.toLocaleString('he-IL')} ₪ (ממוצע: ${mean.toFixed(0)} ₪)`,
            suggestedAction: zScore > 3 ? 'בדוק אם זו הוצאה מוצדקת או טעות' : 'שקול אם ניתן להפחית הוצאות דומות בעתיד'
          });
        }
      });
    });

    return anomalies;
  }

  // זיהוי זחילת סגנון חיים
  detectLifestyleCreep(): AnalysisInsight | null {
    const last3Months = this.getTransactionsFromLastMonths(3);
    const previous3Months = this.getTransactionsFromMonths(6, 3);

    if (last3Months.length === 0 || previous3Months.length === 0) return null;

    const recentAvgMonthly = this.calculateMonthlyAverage(last3Months);
    const previousAvgMonthly = this.calculateMonthlyAverage(previous3Months);

    const increasePercent = (recentAvgMonthly - previousAvgMonthly) / previousAvgMonthly;

    if (increasePercent > 0.15) { // עלייה של יותר מ-15%
      return {
        id: 'lifestyle-creep-detected',
        type: 'warning',
        title: 'זוהתה זחילת סגנון חיים',
        description: `ההוצאות החודשיות שלך עלו ב-${(increasePercent * 100).toFixed(1)}% בחודשים האחרונים`,
        actionItems: [
          'סקור את ההוצאות החדשות שנוספו',
          'זהה הוצאות שניתן לצמצם',
          'קבע תקציב חודשי קבוע'
        ],
        priority: increasePercent > 0.25 ? 'high' : 'medium',
        impact: Math.min(10, Math.floor(increasePercent * 20)),
        confidence: 0.8
      };
    }

    return null;
  }

  private getTransactionsFromLastMonths(months: number): any[] {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    
    return this.transactions.filter(t => 
      t.type === 'expense' && t.date >= cutoffDate
    );
  }

  private getTransactionsFromMonths(startMonthsAgo: number, durationMonths: number): any[] {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() - startMonthsAgo);
    
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - durationMonths);
    
    return this.transactions.filter(t => 
      t.type === 'expense' && t.date >= startDate && t.date <= endDate
    );
  }

  private calculateMonthlyAverage(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const monthsSpan = this.calculateMonthsSpan(transactions);
    
    return totalAmount / Math.max(1, monthsSpan);
  }

  private calculateMonthsSpan(transactions: any[]): number {
    if (transactions.length === 0) return 1;
    
    const dates = transactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                      (lastDate.getMonth() - firstDate.getMonth()) + 1;
    
    return Math.max(1, monthsDiff);
  }

  // 3. תובנות חזויות ותזרים מזומנים
  predictCashFlow(): PredictiveInsight {
    const monthlyIncome = this.calculateAverageMonthlyIncome();
    const monthlyExpenses = this.calculateAverageMonthlyExpenses();
    const currentMonthExpenses = this.getCurrentMonthExpenses();
    
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const currentDay = new Date().getDate();
    const remainingDays = daysInMonth - currentDay;
    
    const dailyBurnRate = currentMonthExpenses / currentDay;
    const projectedMonthlyExpenses = currentMonthExpenses + (dailyBurnRate * remainingDays);
    
    const projectedBalance = monthlyIncome - projectedMonthlyExpenses;
    
    let prediction: string;
    let confidence: number;
    let recommendedActions: string[];

    if (projectedBalance > 0) {
      prediction = `צפוי עודף של ${projectedBalance.toLocaleString('he-IL')} ₪ בסוף החודש`;
      confidence = 0.7;
      recommendedActions = [
        'שקול להעביר חלק לחיסכון',
        'בדוק אם ניתן להאיץ השגת יעדים פיננסיים'
      ];
    } else {
      prediction = `צפוי גירעון של ${Math.abs(projectedBalance).toLocaleString('he-IL')} ₪ בסוף החודש`;
      confidence = 0.8;
      recommendedActions = [
        'צמצם הוצאות לא חיוניות',
        'דחה רכישות גדולות לחודש הבא',
        'בדוק אפשרויות להכנסה נוספת'
      ];
    }

    return {
      type: 'cash_flow',
      prediction,
      confidence,
      timeframe: 'סוף החודש הנוכחי',
      recommendedActions
    };
  }

  private calculateAverageMonthlyIncome(): number {
    const incomeTransactions = this.transactions.filter(t => t.type === 'income');
    if (incomeTransactions.length === 0) return 0;
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthsSpan = this.calculateMonthsSpan(incomeTransactions);
    
    return totalIncome / monthsSpan;
  }

  private calculateAverageMonthlyExpenses(): number {
    const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
    if (expenseTransactions.length === 0) return 0;
    
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthsSpan = this.calculateMonthsSpan(expenseTransactions);
    
    return totalExpenses / monthsSpan;
  }

  private getCurrentMonthExpenses(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return this.transactions
      .filter(t => t.type === 'expense' && 
                  t.date.getMonth() === currentMonth && 
                  t.date.getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // 4. הנעה לפעולה ודחיפות
  generateActionableInsights(): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];

    // בדיקת חריגות תקציב
    const budgetInsights = this.analyzeBudgetBreaches();
    insights.push(...budgetInsights);

    // זיהוי הזדמנויות חיסכון
    const savingsInsights = this.identifySavingsOpportunities();
    insights.push(...savingsInsights);

    // ניתוח התקדמות יעדים
    const goalInsights = this.analyzeGoalProgress();
    insights.push(...goalInsights);

    // זיהוי זחילת סגנון חיים
    const lifestyleInsight = this.detectLifestyleCreep();
    if (lifestyleInsight) insights.push(lifestyleInsight);

    // מיון לפי עדיפות והשפעה
    return insights.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return (priorityWeight[b.priority] * b.impact) - (priorityWeight[a.priority] * a.impact);
    });
  }

  private analyzeBudgetBreaches(): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];

    this.categories.forEach(category => {
      if (category.name === 'הכנסה') return;

      const spent = this.transactions
        .filter(t => t.category === category.name && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / category.budget) * 100;

      if (percentage > 90) {
        insights.push({
          id: `budget-breach-${category.id}`,
          type: percentage > 100 ? 'warning' : 'opportunity',
          title: percentage > 100 ? `חריגה מתקציב ${category.name}` : `התקרבות לגבול תקציב ${category.name}`,
          description: `השתמשת ב-${percentage.toFixed(1)}% מתקציב ${category.name} (${spent.toLocaleString('he-IL')} מתוך ${category.budget.toLocaleString('he-IL')} ₪)`,
          actionItems: percentage > 100 ? [
            'עצור הוצאות בקטגוריה זו לשארית החודש',
            'בדוק אם ניתן להעביר תקציב מקטגוריות אחרות',
            'תכנן טוב יותר לחודש הבא'
          ] : [
            'שקול לצמצם הוצאות בקטגוריה זו',
            'חפש חלופות זולות יותר',
            'דחה רכישות לא דחופות'
          ],
          priority: percentage > 100 ? 'critical' : 'high',
          category: category.name,
          impact: Math.min(10, Math.floor(percentage / 10)),
          confidence: 0.9
        });
      }
    });

    return insights;
  }

  private identifySavingsOpportunities(): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];

    // זיהוי מנויים כפולים או לא בשימוש
    const subscriptions = this.identifySubscriptions();
    if (subscriptions.length > 0) {
      insights.push({
        id: 'subscription-review',
        type: 'opportunity',
        title: 'בדיקת מנויים ותשלומים קבועים',
        description: `זוהו ${subscriptions.length} תשלומים קבועים שכדאי לבדוק`,
        actionItems: [
          'עבור על כל המנויים ובדוק אם אתה משתמש בהם',
          'בטל מנויים שאינם בשימוש',
          'חפש תוכניות זולות יותר אצל ספקים קיימים'
        ],
        priority: 'medium',
        impact: 6,
        confidence: 0.7,
        metadata: { subscriptions }
      });
    }

    return insights;
  }

  private identifySubscriptions(): any[] {
    const recurringTransactions = this.transactions.filter(t => t.type === 'expense');
    const subscriptionPatterns = new Map<string, any[]>();

    recurringTransactions.forEach(transaction => {
      const key = `${transaction.description}-${transaction.amount}`;
      if (!subscriptionPatterns.has(key)) {
        subscriptionPatterns.set(key, []);
      }
      subscriptionPatterns.get(key)!.push(transaction);
    });

    return Array.from(subscriptionPatterns.entries())
      .filter(([, transactions]) => transactions.length >= 2)
      .map(([key, transactions]) => ({
        description: transactions[0].description,
        amount: transactions[0].amount,
        frequency: transactions.length,
        category: transactions[0].category
      }));
  }

  private analyzeGoalProgress(): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];

    this.goals.forEach(goal => {
      const progress = (goal.current / goal.target) * 100;
      const timeLeft = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const monthlyRequired = (goal.target - goal.current) / Math.max(1, timeLeft / 30);

      if (progress < 50 && timeLeft < 90) {
        insights.push({
          id: `goal-behind-${goal.id}`,
          type: 'warning',
          title: `יעד "${goal.title}" מאחור בלוח הזמנים`,
          description: `השגת ${progress.toFixed(1)}% מהיעד, נותרו ${timeLeft} ימים`,
          actionItems: [
            `חסוך ${monthlyRequired.toLocaleString('he-IL')} ₪ בחודש כדי להשיג את היעד`,
            'בדוק אם ניתן לצמצם הוצאות',
            'שקול להאריך את מועד היעד'
          ],
          priority: timeLeft < 30 ? 'high' : 'medium',
          impact: 7,
          confidence: 0.8
        });
      } else if (progress > 80) {
        insights.push({
          id: `goal-almost-${goal.id}`,
          type: 'achievement',
          title: `כמעט השגת יעד "${goal.title}"!`,
          description: `השגת ${progress.toFixed(1)}% מהיעד, נותרו רק ${(goal.target - goal.current).toLocaleString('he-IL')} ₪`,
          actionItems: [
            'המשך במאמץ - אתה קרוב להשגת היעד!',
            'שקול להגדיל את היעד אם תשיג אותו מוקדם'
          ],
          priority: 'low',
          impact: 8,
          confidence: 0.9
        });
      }
    });

    return insights;
  }

  // 5. מנוע הוזלת עלויות והפניות
  analyzeCostReductionOpportunities(): AnalysisInsight[] {
    const insights: AnalysisInsight[] = [];

    // ניתוח הוצאות גבוהות
    const highSpendingCategories = this.identifyHighSpendingCategories();
    highSpendingCategories.forEach(category => {
      insights.push({
        id: `cost-reduction-${category.name}`,
        type: 'opportunity',
        title: `הזדמנות חיסכון בקטגוריית ${category.name}`,
        description: `קטגוריה זו מהווה ${category.percentage.toFixed(1)}% מההוצאות החודשיות`,
        actionItems: [
          'חפש ספקים זולים יותר',
          'בדוק מבצעים והנחות',
          'שקול חלופות זולות יותר'
        ],
        priority: 'medium',
        impact: Math.floor(category.percentage / 10),
        confidence: 0.6,
        category: category.name
      });
    });

    return insights;
  }

  private identifyHighSpendingCategories(): any[] {
    const totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return this.categories
      .filter(cat => cat.name !== 'הכנסה')
      .map(category => {
        const spent = this.transactions
          .filter(t => t.category === category.name && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          name: category.name,
          spent,
          percentage: (spent / totalExpenses) * 100
        };
      })
      .filter(cat => cat.percentage > 20)
      .sort((a, b) => b.percentage - a.percentage);
  }

  // 6. אינטגרציה עם מכניקות משחוק
  generateGamificationData(): any {
    const insights = this.generateActionableInsights();
    const patterns = this.analyzeSpendingPatterns();
    
    return {
      // נקודות על בסיס התנהגות
      points: this.calculateUserPoints(),
      
      // תגים זמינים להשגה
      availableBadges: this.getAvailableBadges(insights, patterns),
      
      // אתגרים מותאמים אישית
      personalizedChallenges: this.generatePersonalizedChallenges(patterns),
      
      // טיפים חינוכיים
      educationalTips: this.generateEducationalTips(insights)
    };
  }

  private calculateUserPoints(): number {
    let points = 0;
    
    // נקודות על עקביות בעדכון
    const recentTransactions = this.getTransactionsFromLastMonths(1);
    points += recentTransactions.length * 5;
    
    // נקודות על שמירה על תקציב
    const budgetCompliance = this.calculateBudgetCompliance();
    points += budgetCompliance * 100;
    
    // נקודות על התקדמות יעדים
    const goalProgress = this.goals.reduce((sum, goal) => sum + (goal.current / goal.target), 0);
    points += goalProgress * 50;
    
    return Math.floor(points);
  }

  private calculateBudgetCompliance(): number {
    const totalBudget = this.categories
      .filter(cat => cat.name !== 'הכנסה')
      .reduce((sum, cat) => sum + cat.budget, 0);
    
    const totalSpent = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return Math.max(0, 1 - (totalSpent / totalBudget));
  }

  private getAvailableBadges(insights: AnalysisInsight[], patterns: SpendingPattern[]): any[] {
    const badges = [];
    
    // תג לחיסכון
    const savingsRate = this.calculateSavingsRate();
    if (savingsRate > 0.2) {
      badges.push({
        id: 'savings-master',
        name: 'מאסטר חיסכון',
        description: 'חסכת מעל 20% מההכנסה',
        progress: Math.min(100, (savingsRate * 100) / 20)
      });
    }
    
    // תג לעקביות
    const consistencyScore = this.calculateConsistencyScore();
    if (consistencyScore > 0.8) {
      badges.push({
        id: 'consistency-champion',
        name: 'אלוף עקביות',
        description: 'עדכנת עסקאות באופן עקבי',
        progress: Math.min(100, consistencyScore * 100)
      });
    }
    
    return badges;
  }

  private calculateSavingsRate(): number {
    const income = this.calculateAverageMonthlyIncome();
    const expenses = this.calculateAverageMonthlyExpenses();
    
    if (income === 0) return 0;
    return Math.max(0, (income - expenses) / income);
  }

  private calculateConsistencyScore(): number {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentTransactions = this.transactions.filter(t => t.date >= last30Days);
    const daysWithTransactions = new Set(recentTransactions.map(t => t.date.toDateString())).size;
    
    return Math.min(1, daysWithTransactions / 30);
  }

  private generatePersonalizedChallenges(patterns: SpendingPattern[]): any[] {
    const challenges = [];
    
    // אתגר לקטגוריה עם מגמת עלייה
    const increasingPattern = patterns.find(p => p.trend === 'increasing');
    if (increasingPattern) {
      challenges.push({
        id: `reduce-${increasingPattern.category}`,
        title: `צמצם הוצאות ${increasingPattern.category}`,
        description: `נסה לחסוך 10% בקטגוריה זו החודש`,
        target: increasingPattern.averageAmount * 0.9,
        category: increasingPattern.category
      });
    }
    
    return challenges;
  }

  private generateEducationalTips(insights: AnalysisInsight[]): string[] {
    const tips = [
      'כלל 50/30/20: 50% לצרכים בסיסיים, 30% לרצונות, 20% לחיסכון',
      'בדוק את המנויים שלך כל 3 חודשים - ייתכן שאתה משלם על שירותים שאינך משתמש בהם',
      'קבע יום קבוע בשבוע לסקירת ההוצאות - זה יעזור לך להישאר מעודכן'
    ];
    
    // הוסף טיפים ספציפיים בהתבסס על התובנות
    insights.forEach(insight => {
      if (insight.type === 'warning' && insight.category) {
        tips.push(`טיפ לקטגוריית ${insight.category}: ${this.getCategorySpecificTip(insight.category)}`);
      }
    });
    
    return tips.slice(0, 5); // החזר עד 5 טיפים
  }

  private getCategorySpecificTip(category: string): string {
    const categoryTips: Record<string, string> = {
      'מזון': 'תכנן תפריט שבועי ועשה רשימת קניות - זה יחסוך לך כסף ויפחית בזבוז',
      'תחבורה': 'שקול שימוש בתחבורה ציבורית או שיתוף נסיעות לחיסכון בעלויות',
      'בילויים': 'חפש פעילויות חינמיות או זולות באזור מגוריך',
      'בריאות': 'השקע בבריאות מונעת - זה יחסוך לך כסף בטווח הארוך',
      'דיור': 'בדוק אם ניתן לחסוך בחשמל ומים על ידי שינוי הרגלי צריכה'
    };
    
    return categoryTips[category] || 'חפש דרכים יצירתיות לחסוך בקטגוריה זו';
  }
}