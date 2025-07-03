import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
}

export interface Category {
  id: string;
  name: string;
  budget: number;
  color: string;
  icon: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  category: string;
  deadline: Date;
  icon: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
}

export interface FinancialState {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  badges: Badge[];
  monthlyBudget: number;
  pitStopMessages: string[];
}

type FinancialAction = 
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'EARN_BADGE'; payload: string }
  | { type: 'SET_MONTHLY_BUDGET'; payload: number }
  | { type: 'ADD_PIT_STOP_MESSAGE'; payload: string };

const initialState: FinancialState = {
  transactions: [
    {
      id: '1',
      amount: 5000,
      description: 'משכורת',
      category: 'הכנסה',
      date: new Date(),
      type: 'income'
    },
    {
      id: '2',
      amount: 1200,
      description: 'שכר דירה',
      category: 'דיור',
      date: new Date(),
      type: 'expense'
    },
    {
      id: '3',
      amount: 300,
      description: 'קניות שבועיות',
      category: 'מזון',
      date: new Date(),
      type: 'expense'
    }
  ],
  categories: [
    { id: '1', name: 'דיור', budget: 1500, color: '#3b82f6', icon: 'Home' },
    { id: '2', name: 'מזון', budget: 800, color: '#10b981', icon: 'UtensilsCrossed' },
    { id: '3', name: 'תחבורה', budget: 600, color: '#f59e0b', icon: 'Car' },
    { id: '4', name: 'בילויים', budget: 400, color: '#ef4444', icon: 'PartyPopper' },
    { id: '5', name: 'בריאות', budget: 300, color: '#8b5cf6', icon: 'Heart' },
    { id: '6', name: 'חינוך', budget: 200, color: '#06b6d4', icon: 'GraduationCap' },
    { id: '7', name: 'הכנסה', budget: 0, color: '#22c55e', icon: 'TrendingUp' }
  ],
  goals: [
    {
      id: '1',
      title: 'קרן חירום',
      target: 10000,
      current: 3500,
      category: 'חיסכון',
      deadline: new Date(2024, 11, 31),
      icon: 'Shield'
    },
    {
      id: '2',
      title: 'חופשה',
      target: 5000,
      current: 1200,
      category: 'בילויים',
      deadline: new Date(2024, 6, 15),
      icon: 'Plane'
    }
  ],
  badges: [
    { id: '1', name: 'אלוף תקציב', description: 'הקפדת על התקציב שלושה חודשים ברצף', icon: 'Trophy', earned: true, earnedDate: new Date() },
    { id: '2', name: 'מקצועי חיסכון', description: 'חסכת מעל 20% מההכנסה החודשית', icon: 'PiggyBank', earned: false },
    { id: '3', name: 'נהג מדויק', description: 'תיעדת כל הוצאה במשך חודש שלם', icon: 'Target', earned: true },
    { id: '4', name: 'מנהל מטרות', description: 'השגת מטרה פיננסית', icon: 'Flag', earned: false }
  ],
  monthlyBudget: 4000,
  pitStopMessages: [
    'נהיגה מדויקת! אתה בתוך התקציב החודשי',
    'שימו לב: עברתם 80% מתקציב המזון',
    'כל הכבוד! השגתם מטרה חדשה'
  ]
};

const financialReducer = (state: FinancialState, action: FinancialAction): FinancialState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        )
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload)
      };
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload]
      };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => 
          g.id === action.payload.id ? action.payload : g
        )
      };
    case 'EARN_BADGE':
      return {
        ...state,
        badges: state.badges.map(b => 
          b.id === action.payload ? { ...b, earned: true, earnedDate: new Date() } : b
        )
      };
    case 'SET_MONTHLY_BUDGET':
      return {
        ...state,
        monthlyBudget: action.payload
      };
    case 'ADD_PIT_STOP_MESSAGE':
      return {
        ...state,
        pitStopMessages: [action.payload, ...state.pitStopMessages.slice(0, 4)]
      };
    default:
      return state;
  }
};

const FinancialContext = createContext<{
  state: FinancialState;
  dispatch: React.Dispatch<FinancialAction>;
} | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financialReducer, initialState);

  return (
    <FinancialContext.Provider value={{ state, dispatch }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};