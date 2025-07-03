import { FinancialState, Transaction } from '../context/FinancialContext';

export interface ChatResponse {
  message: string;
  actions?: ChatAction[];
  data?: any;
  autoActions?: ChatAction[];
}

export interface ChatAction {
  id: string;
  label: string;
  type: 'update' | 'query' | 'navigate';
  payload?: any;
}

export class ChatEngine {
  private state: FinancialState;
  private dispatch: React.Dispatch<any>;

  constructor(state: FinancialState, dispatch: React.Dispatch<any>) {
    this.state = state;
    this.dispatch = dispatch;
  }

  async processMessage(message: string): Promise<ChatResponse> {
    const intent = this.analyzeIntent(message);
    
    switch (intent.type) {
      case 'add_transaction':
        return this.handleAddTransaction(intent.data);
      case 'query_balance':
        return this.handleBalanceQuery();
      case 'query_budget':
        return this.handleBudgetQuery(intent.data);
      case 'query_category':
        return this.handleCategoryQuery(intent.data);
      case 'query_goals':
        return this.handleGoalsQuery();
      case 'update_budget':
        return this.handleBudgetUpdate(intent.data);
      case 'financial_advice':
        return this.handleFinancialAdvice();
      case 'greeting':
        return this.handleGreeting();
      case 'help':
        return this.handleHelp();
      default:
        return this.handleUnknown(message);
    }
  }

  private analyzeIntent(message: string): { type: string; data?: any } {
    const lowerMessage = message.toLowerCase();

    // זיהוי הוספת עסקה
    const addTransactionPatterns = [
      /הוספתי?\s+(\d+)\s*ש?"?ח?\s+(ל|על|עבור)?\s*(.+)/,
      /הוצאתי?\s+(\d+)\s*ש?"?ח?\s+(על|עבור)?\s*(.+)/,
      /קניתי?\s+(.+)\s+ב?(\d+)\s*ש?"?ח?/,
      /שילמתי?\s+(\d+)\s*ש?"?ח?\s+(עבור|על)?\s*(.+)/
    ];

    for (const pattern of addTransactionPatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'add_transaction',
          data: {
            amount: parseInt(match[1] || match[2]),
            description: match[3] || match[1] || 'הוצאה',
            type: 'expense'
          }
        };
      }
    }

    // זיהוי הכנסה
    const incomePatterns = [
      /קיבלתי?\s+(\d+)\s*ש?"?ח?\s+(מ|עבור)?\s*(.+)/,
      /הכנסה\s+של\s+(\d+)\s*ש?"?ח?/
    ];

    for (const pattern of incomePatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'add_transaction',
          data: {
            amount: parseInt(match[1]),
            description: match[3] || 'הכנסה',
            type: 'income'
          }
        };
      }
    }

    // שאילתות יתרה ומצב כספי
    if (lowerMessage.includes('יתרה') || lowerMessage.includes('מצב כספי') || 
        lowerMessage.includes('כמה כסף') || lowerMessage.includes('מה המצב')) {
      return { type: 'query_balance' };
    }

    // שאילתות תקציב
    if (lowerMessage.includes('תקציב') || lowerMessage.includes('כמה נשאר') ||
        lowerMessage.includes('איך התקציב')) {
      return { type: 'query_budget' };
    }

    // שאילתות קטגוריות
    const categoryPatterns = [
      /כמה הוצאתי על (.+)/,
      /מה ההוצאה על (.+)/,
      /כמה עלה לי (.+)/
    ];

    for (const pattern of categoryPatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'query_category',
          data: { category: this.mapCategoryName(match[1]) }
        };
      }
    }

    // שאילתות יעדים
    if (lowerMessage.includes('יעד') || lowerMessage.includes('מטרה') ||
        lowerMessage.includes('חיסכון') || lowerMessage.includes('השגתי')) {
      return { type: 'query_goals' };
    }

    // עדכון תקציב
    const budgetUpdatePatterns = [
      /תוריד את התקציב של (.+) ל(\d+)/,
      /תעלה את התקציב של (.+) ל(\d+)/,
      /תשנה את התקציב של (.+) ל(\d+)/
    ];

    for (const pattern of budgetUpdatePatterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'update_budget',
          data: {
            category: this.mapCategoryName(match[1]),
            amount: parseInt(match[2])
          }
        };
      }
    }

    // ייעוץ פיננסי
    if (lowerMessage.includes('ייעוץ') || lowerMessage.includes('עצה') ||
        lowerMessage.includes('מה לעשות') || lowerMessage.includes('איך לחסוך') ||
        lowerMessage.includes('המלצה')) {
      return { type: 'financial_advice' };
    }

    // ברכות
    if (lowerMessage.includes('שלום') || lowerMessage.includes('היי') ||
        lowerMessage.includes('בוקר טוב') || lowerMessage.includes('ערב טוב')) {
      return { type: 'greeting' };
    }

    // עזרה
    if (lowerMessage.includes('עזרה') || lowerMessage.includes('איך') ||
        lowerMessage.includes('מה אפשר') || lowerMessage.includes('פקודות')) {
      return { type: 'help' };
    }

    return { type: 'unknown' };
  }

  private mapCategoryName(input: string): string {
    const categoryMap: Record<string, string> = {
      'אוכל': 'מזון',
      'אכילה': 'מזון',
      'קניות': 'מזון',
      'סופר': 'מזון',
      'מכולת': 'מזון',
      'דלק': 'תחבורה',
      'בנזין': 'תחבורה',
      'אוטובוס': 'תחבורה',
      'רכבת': 'תחבורה',
      'מונית': 'תחבורה',
      'שכר דירה': 'דיור',
      'משכנתא': 'דיור',
      'חשמל': 'דיור',
      'מים': 'דיור',
      'ארנונה': 'דיור',
      'מסעדה': 'בילויים',
      'קולנוע': 'בילויים',
      'בר': 'בילויים',
      'קפה': 'בילויים',
      'רופא': 'בריאות',
      'תרופות': 'בריאות',
      'ביטוח': 'בריאות',
      'ספרים': 'חינוך',
      'קורס': 'חינוך',
      'לימודים': 'חינוך'
    };

    const lowerInput = input.toLowerCase().trim();
    return categoryMap[lowerInput] || input;
  }

  private async handleAddTransaction(data: any): Promise<ChatResponse> {
    const category = this.suggestCategory(data.description);
    
    const transaction: Omit<Transaction, 'id'> = {
      amount: data.amount,
      description: data.description,
      category: category.name,
      date: new Date(),
      type: data.type
    };

    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };

    // הוספת העסקה למערכת
    const autoActions: ChatAction[] = [{
      id: 'add-transaction',
      label: 'הוסף עסקה',
      type: 'update',
      payload: {
        type: 'ADD_TRANSACTION',
        payload: newTransaction
      }
    }];

    const actions: ChatAction[] = [];
    
    // אם הקטגוריה לא בטוחה, הצע אפשרויות
    if (category.confidence < 0.8) {
      const alternativeCategories = this.state.categories
        .filter(cat => cat.name !== category.name && cat.name !== 'הכנסה')
        .slice(0, 3);
      
      alternativeCategories.forEach(cat => {
        actions.push({
          id: `change-category-${cat.id}`,
          label: `שנה לקטגוריית ${cat.name}`,
          type: 'update',
          payload: {
            type: 'UPDATE_TRANSACTION',
            payload: { ...newTransaction, category: cat.name }
          }
        });
      });
    }

    return {
      message: `✅ נוספה עסקה: ${data.description} - ${data.amount} ₪ בקטגוריית ${category.name}${
        category.confidence < 0.8 ? '\n\n🤔 לא בטוח בקטגוריה? תוכל לשנות:' : ''
      }`,
      actions,
      autoActions,
      data: {
        type: 'transaction_added',
        transaction: newTransaction
      }
    };
  }

  private suggestCategory(description: string): { name: string; confidence: number } {
    const keywords = {
      'מזון': ['סופר', 'מכולת', 'קניות', 'אוכל', 'מזון', 'רמי לוי', 'שופרסל'],
      'תחבורה': ['דלק', 'בנזין', 'אוטובוס', 'רכבת', 'מונית', 'חניה'],
      'דיור': ['שכר דירה', 'משכנתא', 'חשמל', 'מים', 'ארנונה', 'גז'],
      'בילויים': ['מסעדה', 'קולנוע', 'בר', 'קפה', 'בידור'],
      'בריאות': ['רופא', 'תרופות', 'בית מרקחת', 'ביטוח'],
      'חינוך': ['ספרים', 'קורס', 'לימודים', 'גן ילדים']
    };

    let bestMatch = { name: 'אחר', confidence: 0 };

    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      const matches = categoryKeywords.filter(keyword => 
        description.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matches.length > 0) {
        const confidence = matches.length / categoryKeywords.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = { name: category, confidence };
        }
      }
    }

    // אם לא נמצאה התאמה טובה, השתמש בקטגוריה הראשונה
    if (bestMatch.confidence === 0) {
      bestMatch = { name: this.state.categories[0]?.name || 'אחר', confidence: 0.3 };
    }

    return bestMatch;
  }

  private async handleBalanceQuery(): Promise<ChatResponse> {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = this.state.transactions
      .filter(t => t.type === 'income' && 
                  t.date.getMonth() === currentMonth && 
                  t.date.getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = this.state.transactions
      .filter(t => t.type === 'expense' && 
                  t.date.getMonth() === currentMonth && 
                  t.date.getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = monthlyIncome - monthlyExpenses;
    const budgetUsage = (monthlyExpenses / this.state.monthlyBudget) * 100;

    const actions: ChatAction[] = [
      {
        id: 'view-transactions',
        label: 'צפה בעסקאות החודש',
        type: 'navigate',
        payload: { route: '/transactions' }
      },
      {
        id: 'view-analysis',
        label: 'ניתוח מפורט',
        type: 'navigate',
        payload: { route: '/analysis' }
      }
    ];

    let statusEmoji = '💚';
    let statusMessage = 'נהיגה מצוינת!';
    
    if (budgetUsage > 90) {
      statusEmoji = '🔴';
      statusMessage = 'זיהינו חריגה - עצור לפיט סטופ!';
    } else if (budgetUsage > 75) {
      statusEmoji = '🟡';
      statusMessage = 'נהיגה זהירה - שים לב למהירות!';
    }

    return {
      message: `${statusEmoji} **המצב הכספי שלך החודש:**

💰 **הכנסות:** ${monthlyIncome.toLocaleString('he-IL')} ₪
💸 **הוצאות:** ${monthlyExpenses.toLocaleString('he-IL')} ₪
📊 **יתרה:** ${balance.toLocaleString('he-IL')} ₪

🏁 **שימוש בתקציב:** ${budgetUsage.toFixed(1)}% מתוך ${this.state.monthlyBudget.toLocaleString('he-IL')} ₪

${statusMessage}`,
      actions
    };
  }

  private async handleBudgetQuery(data?: any): Promise<ChatResponse> {
    const categoryUsage = this.state.categories
      .filter(cat => cat.name !== 'הכנסה')
      .map(category => {
        const used = this.state.transactions
          .filter(t => t.category === category.name && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          name: category.name,
          used,
          budget: category.budget,
          percentage: category.budget > 0 ? (used / category.budget) * 100 : 0
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const criticalCategories = categoryUsage.filter(cat => cat.percentage > 90);
    const warningCategories = categoryUsage.filter(cat => cat.percentage > 75 && cat.percentage <= 90);

    let message = '📊 **מצב התקציב שלך:**\n\n';

    if (criticalCategories.length > 0) {
      message += '🚨 **קטגוריות בחריגה:**\n';
      criticalCategories.forEach(cat => {
        message += `• ${cat.name}: ${cat.percentage.toFixed(1)}% (${cat.used.toLocaleString('he-IL')}/${cat.budget.toLocaleString('he-IL')} ₪)\n`;
      });
      message += '\n';
    }

    if (warningCategories.length > 0) {
      message += '⚠️ **קטגוריות להשגחה:**\n';
      warningCategories.forEach(cat => {
        message += `• ${cat.name}: ${cat.percentage.toFixed(1)}% (${cat.used.toLocaleString('he-IL')}/${cat.budget.toLocaleString('he-IL')} ₪)\n`;
      });
      message += '\n';
    }

    const goodCategories = categoryUsage.filter(cat => cat.percentage <= 75);
    if (goodCategories.length > 0) {
      message += '✅ **קטגוריות במצב טוב:**\n';
      goodCategories.slice(0, 3).forEach(cat => {
        message += `• ${cat.name}: ${cat.percentage.toFixed(1)}% (נותרו ${(cat.budget - cat.used).toLocaleString('he-IL')} ₪)\n`;
      });
    }

    const actions: ChatAction[] = [
      {
        id: 'budget-tips',
        label: 'קבל טיפים לחיסכון',
        type: 'query'
      },
      {
        id: 'adjust-budget',
        label: 'התאם תקציב',
        type: 'navigate',
        payload: { route: '/profile' }
      }
    ];

    return {
      message,
      actions,
      data: {
        type: 'budget_summary',
        categories: categoryUsage
      }
    };
  }

  private async handleCategoryQuery(data: any): Promise<ChatResponse> {
    const category = data.category;
    const categoryTransactions = this.state.transactions
      .filter(t => t.category === category && t.type === 'expense');

    if (categoryTransactions.length === 0) {
      return {
        message: `🤷‍♂️ לא מצאתי הוצאות בקטגוריית "${category}". אולי התכוונת לקטגוריה אחרת?`,
        actions: [
          {
            id: 'show-categories',
            label: 'הצג את כל הקטגוריות',
            type: 'query'
          }
        ]
      };
    }

    const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const categoryBudget = this.state.categories.find(cat => cat.name === category)?.budget || 0;
    const percentage = categoryBudget > 0 ? (totalSpent / categoryBudget) * 100 : 0;

    const recentTransactions = categoryTransactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3);

    let message = `💰 **הוצאות בקטגוריית ${category}:**\n\n`;
    message += `📊 סה"כ הוצאות: ${totalSpent.toLocaleString('he-IL')} ₪\n`;
    
    if (categoryBudget > 0) {
      message += `🎯 תקציב: ${categoryBudget.toLocaleString('he-IL')} ₪ (${percentage.toFixed(1)}%)\n`;
      message += `💸 נותרו: ${(categoryBudget - totalSpent).toLocaleString('he-IL')} ₪\n\n`;
    }

    if (recentTransactions.length > 0) {
      message += `📝 **עסקאות אחרונות:**\n`;
      recentTransactions.forEach(t => {
        message += `• ${t.description}: ${t.amount.toLocaleString('he-IL')} ₪ (${t.date.toLocaleDateString('he-IL')})\n`;
      });
    }

    const actions: ChatAction[] = [
      {
        id: `add-${category}`,
        label: `הוסף הוצאה ל${category}`,
        type: 'update'
      },
      {
        id: 'category-analysis',
        label: 'ניתוח מפורט',
        type: 'navigate',
        payload: { route: '/analysis' }
      }
    ];

    return { message, actions };
  }

  private async handleGoalsQuery(): Promise<ChatResponse> {
    if (this.state.goals.length === 0) {
      return {
        message: '🎯 עדיין לא הגדרת יעדים פיננסיים. בואו נתחיל!',
        actions: [
          {
            id: 'create-goal',
            label: 'צור יעד חדש',
            type: 'navigate',
            payload: { route: '/profile' }
          }
        ]
      };
    }

    let message = '🎯 **המטרות הפיננסיות שלך:**\n\n';

    this.state.goals.forEach(goal => {
      const progress = (goal.current / goal.target) * 100;
      const remaining = goal.target - goal.current;
      const daysLeft = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

      let statusEmoji = '🟢';
      if (progress < 25) statusEmoji = '🔴';
      else if (progress < 50) statusEmoji = '🟡';
      else if (progress < 75) statusEmoji = '🟠';

      message += `${statusEmoji} **${goal.title}**\n`;
      message += `📈 התקדמות: ${progress.toFixed(1)}% (${goal.current.toLocaleString('he-IL')}/${goal.target.toLocaleString('he-IL')} ₪)\n`;
      message += `⏰ נותרו: ${daysLeft} ימים\n`;
      message += `💰 עוד צריך: ${remaining.toLocaleString('he-IL')} ₪\n\n`;
    });

    const actions: ChatAction[] = [
      {
        id: 'update-goals',
        label: 'עדכן התקדמות',
        type: 'navigate',
        payload: { route: '/profile' }
      },
      {
        id: 'goal-tips',
        label: 'טיפים להשגת יעדים',
        type: 'query'
      }
    ];

    return { message, actions };
  }

  private async handleFinancialAdvice(): Promise<ChatResponse> {
    const monthlyExpenses = this.state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = this.state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    let advice = '💡 **ייעוץ פיננסי מותאם אישית:**\n\n';

    if (savingsRate < 10) {
      advice += '🚨 **שיעור החיסכון שלך נמוך מדי!**\n';
      advice += '• נסה לחסוך לפחות 20% מההכנסה\n';
      advice += '• בדוק הוצאות שניתן לצמצם\n';
      advice += '• שקול הכנסות נוספות\n\n';
    } else if (savingsRate < 20) {
      advice += '⚠️ **שיעור חיסכון סביר, אבל יש מקום לשיפור:**\n';
      advice += '• המטרה היא 20% חיסכון\n';
      advice += '• חפש הוצאות מיותרות\n';
      advice += '• הגדל את ההכנסה אם אפשר\n\n';
    } else {
      advice += '✅ **כל הכבוד! שיעור חיסכון מעולה:**\n';
      advice += '• אתה בדרך הנכונה\n';
      advice += '• שקול השקעות לטווח ארוך\n';
      advice += '• הגדל את היעדים הפיננסיים\n\n';
    }

    // טיפים ספציפיים בהתבסס על דפוסי הוצאות
    const topCategory = this.getTopSpendingCategory();
    if (topCategory) {
      advice += `💰 **הקטגוריה הכי יקרה שלך: ${topCategory.name}**\n`;
      advice += this.getCategoryAdvice(topCategory.name);
    }

    const actions: ChatAction[] = [
      {
        id: 'detailed-analysis',
        label: 'ניתוח מפורט',
        type: 'navigate',
        payload: { route: '/analysis' }
      },
      {
        id: 'set-savings-goal',
        label: 'קבע יעד חיסכון',
        type: 'navigate',
        payload: { route: '/profile' }
      }
    ];

    return { message: advice, actions };
  }

  private getTopSpendingCategory(): { name: string; amount: number } | null {
    const categoryTotals = this.state.categories
      .filter(cat => cat.name !== 'הכנסה')
      .map(category => {
        const amount = this.state.transactions
          .filter(t => t.category === category.name && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        return { name: category.name, amount };
      })
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return categoryTotals.length > 0 ? categoryTotals[0] : null;
  }

  private getCategoryAdvice(category: string): string {
    const adviceMap: Record<string, string> = {
      'מזון': '• תכנן תפריט שבועי\n• עשה רשימת קניות\n• קנה במבצעים\n• בשל בבית במקום להזמין\n\n',
      'תחבורה': '• שקול תחבורה ציבורית\n• שתף נסיעות\n• הליכה או אופניים למרחקים קצרים\n• בדוק מחירי דלק\n\n',
      'בילויים': '• חפש פעילויות חינמיות\n• בלה בבית עם חברים\n• נצל מבצעים ובילויים\n• קבע תקציב חודשי לבילויים\n\n',
      'דיור': '• בדוק חיסכון בחשמל ומים\n• שקול שיפוץ לחיסכון אנרגיה\n• השווה ספקי שירותים\n• בדוק הנחות לתושבי ותק\n\n',
      'בריאות': '• השקע בבריאות מונעת\n• השווה מחירי תרופות\n• בדוק זכאות לסבסוד\n• שמור על אורח חיים בריא\n\n'
    };

    return adviceMap[category] || '• בדוק אפשרויות לחיסכון בקטגוריה זו\n• השווה מחירים\n• שקול חלופות זולות יותר\n\n';
  }

  private async handleGreeting(): Promise<ChatResponse> {
    const hour = new Date().getHours();
    let greeting = '👋 שלום!';
    
    if (hour < 12) greeting = '🌅 בוקר טוב!';
    else if (hour < 18) greeting = '☀️ צהריים טובים!';
    else greeting = '🌙 ערב טוב!';

    const actions: ChatAction[] = [
      {
        id: 'daily-summary',
        label: 'מה המצב היום?',
        type: 'query'
      },
      {
        id: 'quick-add',
        label: 'הוסף הוצאה מהירה',
        type: 'update'
      },
      {
        id: 'view-goals',
        label: 'בדוק התקדמות יעדים',
        type: 'query'
      }
    ];

    return {
      message: `${greeting} אני כאן לעזור לך לנהל את הכספים שלך. מה תרצה לעשות?`,
      actions
    };
  }

  private async handleHelp(): Promise<ChatResponse> {
    const message = `🤖 **אני יכול לעזור לך עם:**

📝 **עדכון עסקאות:**
• "הוספתי 50 ש"ח לקניות"
• "הוצאתי 200 ש"ח על דלק"
• "קיבלתי 5000 ש"ח משכורת"

📊 **שאילתות מידע:**
• "מה המצב הכספי שלי?"
• "כמה הוצאתי על אוכל?"
• "איך התקציב שלי?"
• "מה המטרות שלי?"

⚙️ **עדכון הגדרות:**
• "תוריד את התקציב של בילויים ל-300"
• "תעלה את התקציב של מזון ל-800"

💡 **ייעוץ פיננסי:**
• "תן לי עצה"
• "איך לחסוך יותר?"
• "מה המלצותיך?"

🎯 **ניהול יעדים:**
• "מה המטרות שלי?"
• "איך אני מתקדם?"

פשוט כתוב לי בשפה טבעית ואני אבין! 😊`;

    const actions: ChatAction[] = [
      {
        id: 'try-balance',
        label: 'נסה: "מה המצב שלי?"',
        type: 'query'
      },
      {
        id: 'try-add',
        label: 'נסה: "הוספתי 100 ש"ח לקניות"',
        type: 'update'
      }
    ];

    return { message, actions };
  }

  private async handleUnknown(message: string): Promise<ChatResponse> {
    const suggestions = [
      'נסה לשאול "מה המצב הכספי שלי?"',
      'תוכל לכתוב "הוספתי 50 ש"ח לקניות"',
      'נסה "כמה הוצאתי על אוכל החודש?"',
      'תוכל לבקש "תן לי עצה פיננסית"'
    ];

    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

    return {
      message: `🤔 לא הבנתי בדיוק מה התכוונת. ${randomSuggestion}

או כתוב "עזרה" לרשימה מלאה של פקודות שאני מבין.`,
      actions: [
        {
          id: 'show-help',
          label: 'הצג עזרה',
          type: 'query'
        },
        {
          id: 'try-examples',
          label: 'דוגמאות לפקודות',
          type: 'query'
        }
      ]
    };
  }

  async handleQuickAction(actionId: string): Promise<ChatResponse> {
    switch (actionId) {
      case 'quick-balance':
        return this.handleBalanceQuery();
      case 'budget-status':
        return this.handleBudgetQuery();
      case 'daily-summary':
        return this.handleDailySummary();
      case 'budget-tips':
        return this.handleBudgetTips();
      case 'goal-tips':
        return this.handleGoalTips();
      default:
        return this.handleHelp();
    }
  }

  private async handleDailySummary(): Promise<ChatResponse> {
    const today = new Date();
    const todayTransactions = this.state.transactions.filter(t => 
      t.date.toDateString() === today.toDateString()
    );

    const todayExpenses = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    let message = `📅 **סיכום היום (${today.toLocaleDateString('he-IL')}):**\n\n`;

    if (todayTransactions.length === 0) {
      message += '📝 עדיין לא רשמת עסקאות היום.\n\n';
      message += '💡 זכור לעדכן את ההוצאות שלך כדי לשמור על מעקב מדויק!';
    } else {
      message += `💸 הוצאות: ${todayExpenses.toLocaleString('he-IL')} ₪\n`;
      message += `💰 הכנסות: ${todayIncome.toLocaleString('he-IL')} ₪\n`;
      message += `📊 יתרה יומית: ${(todayIncome - todayExpenses).toLocaleString('he-IL')} ₪\n\n`;

      if (todayTransactions.length > 0) {
        message += '📝 **עסקאות היום:**\n';
        todayTransactions.slice(0, 5).forEach(t => {
          const emoji = t.type === 'income' ? '💰' : '💸';
          message += `${emoji} ${t.description}: ${t.amount.toLocaleString('he-IL')} ₪\n`;
        });
      }
    }

    const actions: ChatAction[] = [
      {
        id: 'add-expense',
        label: 'הוסף הוצאה',
        type: 'update'
      },
      {
        id: 'view-week',
        label: 'צפה בשבוע',
        type: 'query'
      }
    ];

    return { message, actions };
  }

  private async handleBudgetTips(): Promise<ChatResponse> {
    const overBudgetCategories = this.state.categories
      .filter(cat => cat.name !== 'הכנסה')
      .map(category => {
        const used = this.state.transactions
          .filter(t => t.category === category.name && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        return { ...category, used, percentage: (used / category.budget) * 100 };
      })
      .filter(cat => cat.percentage > 80)
      .sort((a, b) => b.percentage - a.percentage);

    let message = '💡 **טיפים לחיסכון מותאמים אישית:**\n\n';

    if (overBudgetCategories.length > 0) {
      message += '🎯 **קטגוריות שדורשות תשומת לב:**\n\n';
      
      overBudgetCategories.slice(0, 2).forEach(cat => {
        message += `**${cat.name}** (${cat.percentage.toFixed(1)}% מהתקציב):\n`;
        message += this.getCategoryAdvice(cat.name);
      });
    } else {
      message += '✅ **כל הכבוד! אתה מנהל את התקציב טוב!**\n\n';
      message += '💡 **טיפים כלליים להמשך הצלחה:**\n';
      message += '• המשך לעקוב אחר ההוצאות יומיומיות\n';
      message += '• בדוק את התקציב שבועית\n';
      message += '• חפש הזדמנויות להגדיל את החיסכון\n';
      message += '• שקול השקעות לטווח ארוך\n\n';
    }

    message += '🏆 **כלל הזהב:** 50% צרכים, 30% רצונות, 20% חיסכון!';

    return { message };
  }

  private async handleGoalTips(): Promise<ChatResponse> {
    if (this.state.goals.length === 0) {
      return {
        message: '🎯 עדיין לא הגדרת יעדים! בואו נתחיל עם יעד קטן ומשמעותי.',
        actions: [
          {
            id: 'create-goal',
            label: 'צור יעד חדש',
            type: 'navigate',
            payload: { route: '/profile' }
          }
        ]
      };
    }

    let message = '🎯 **טיפים להשגת היעדים שלך:**\n\n';

    this.state.goals.forEach(goal => {
      const progress = (goal.current / goal.target) * 100;
      const daysLeft = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const monthlyRequired = (goal.target - goal.current) / Math.max(1, daysLeft / 30);

      message += `**${goal.title}:**\n`;
      
      if (progress < 25) {
        message += '🚀 זמן להאיץ! נסה:\n';
        message += `• חסוך ${monthlyRequired.toLocaleString('he-IL')} ₪ בחודש\n`;
        message += '• צמצם הוצאות לא חיוניות\n';
        message += '• חפש הכנסות נוספות\n\n';
      } else if (progress < 75) {
        message += '💪 אתה בדרך הנכונה! המשך:\n';
        message += `• ${monthlyRequired.toLocaleString('he-IL')} ₪ בחודש יביאו אותך ליעד\n`;
        message += '• שמור על הקצב הנוכחי\n';
        message += '• בדוק התקדמות שבועית\n\n';
      } else {
        message += '🏆 כמעט שם! עוד קצת:\n';
        message += `• נותרו רק ${(goal.target - goal.current).toLocaleString('he-IL')} ₪\n`;
        message += '• אל תוותר עכשיו!\n';
        message += '• תכנן חגיגה להשגת היעד\n\n';
      }
    });

    return { message };
  }
}