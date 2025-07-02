import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Car, Gauge, DollarSign, Wallet, Target, Bell, TrendingUp,
  ListFilter, Search, ArrowDownUp, Plus, Minus, Edit, Trash2,
  Sliders, UserCog, FileText, Lightbulb, Trophy, Award, Tag, X
} from 'lucide-react'; // Using lucide-react for modern icons

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount);
};

// Default Categories
const defaultCategories = ["מזון", "דיור", "תחבורה", "בילויים", "חינוך", "בריאות", "אחר"];

// All Badges
const allBadges = [
  { id: 'first_transaction', name: 'נהג מתחיל', icon: 'Car', description: 'הזנת טרנזקציה ראשונה' },
  { id: 'budget_setter', name: 'מתכנן מסלול', icon: 'Sliders', description: 'הגדרת תקציב חודשי' },
  { id: 'first_goal', name: 'מציב יעדים', icon: 'Target', description: 'הגדרת יעד פיננסי ראשון' },
  { id: 'consistent_week', name: 'נהיגה עקבית', icon: 'CalendarCheck', description: 'עדכון הוצאות במשך שבוע רצוף' },
  { id: 'budget_master', name: 'אלוף התקציב', icon: 'Trophy', description: 'עמידה בתקציב חודשי' },
  { id: 'saving_champion', name: 'אלוף חיסכון', icon: 'PiggyBank', description: 'השגת יעד חיסכון' }
];

// Main App Component
const App = () => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [customCategories, setCustomCategories] = useState([]);
  const [allCategories, setAllCategories] = useState(defaultCategories);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [financialGoals, setFinancialGoals] = useState([]);
  const [driverProfile, setDriverProfile] = useState({
    type: 'זהיר',
    preferredTool: 'אפליקציה',
    reviewFrequency: 'שבועי'
  });
  const [driverPoints, setDriverPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [pitStopMessages, setPitStopMessages] = useState([]);

  // Filter & Sort State
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [sortOrder, setSortOrder] = useState({ by: 'date', direction: 'desc' });

  // Modal States
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isDriverProfileModalOpen, setIsDriverProfileModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isGoalSelectionModalOpen, setIsGoalSelectionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState(null); // For editing transactions

  // Refs for modals to handle outside clicks
  const transactionModalRef = useRef();
  const budgetModalRef = useRef();
  const driverProfileModalRef = useRef();
  const goalModalRef = useRef();
  const goalSelectionModalRef = useRef();
  const categoryModalRef = useRef();


  // --- Data Persistence (using localStorage for simplicity) ---
  const saveData = useCallback(() => {
    localStorage.setItem('f1_dashboard_transactions', JSON.stringify(transactions));
    localStorage.setItem('f1_dashboard_monthly_budget', monthlyBudget.toString());
    localStorage.setItem('f1_dashboard_category_budgets', JSON.stringify(categoryBudgets));
    localStorage.setItem('f1_dashboard_financial_goals', JSON.stringify(financialGoals));
    localStorage.setItem('f1_dashboard_driver_profile', JSON.stringify(driverProfile));
    localStorage.setItem('f1_dashboard_driver_points', driverPoints.toString());
    localStorage.setItem('f1_dashboard_earned_badges', JSON.stringify(earnedBadges));
    localStorage.setItem('f1_dashboard_custom_categories', JSON.stringify(customCategories));
  }, [transactions, monthlyBudget, categoryBudgets, financialGoals, driverProfile, driverPoints, earnedBadges, customCategories]);

  const loadData = useCallback(() => {
    const savedTransactions = localStorage.getItem('f1_dashboard_transactions');
    const savedMonthlyBudget = localStorage.getItem('f1_dashboard_monthly_budget');
    const savedCategoryBudgets = localStorage.getItem('f1_dashboard_category_budgets');
    const savedFinancialGoals = localStorage.getItem('f1_dashboard_financial_goals');
    const savedDriverProfile = localStorage.getItem('f1_dashboard_driver_profile');
    const savedDriverPoints = localStorage.getItem('f1_dashboard_driver_points');
    const savedEarnedBadges = localStorage.getItem('f1_dashboard_earned_badges');
    const savedCustomCategories = localStorage.getItem('f1_dashboard_custom_categories');

    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedMonthlyBudget) setMonthlyBudget(parseFloat(savedMonthlyBudget));
    if (savedCategoryBudgets) setCategoryBudgets(JSON.parse(savedCategoryBudgets));
    if (savedFinancialGoals) setFinancialGoals(JSON.parse(savedFinancialGoals));
    if (savedDriverProfile) setDriverProfile(JSON.parse(savedDriverProfile));
    if (savedDriverPoints) setDriverPoints(parseInt(savedDriverPoints));
    if (savedEarnedBadges) setEarnedBadges(JSON.parse(savedEarnedBadges));
    if (savedCustomCategories) setCustomCategories(JSON.parse(savedCustomCategories));
  }, []);

  // --- Category Management ---
  const updateAllCategories = useCallback(() => {
    const combinedCategories = [...defaultCategories, ...customCategories];
    setAllCategories([...new Set(combinedCategories)]);
  }, [customCategories]);

  // --- Calculations ---
  const calculateMonthlyExpenses = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return transactions.filter(t =>
      t.type === 'expense' &&
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear
    ).reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const calculateMonthlyIncome = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return transactions.filter(t =>
      t.type === 'income' &&
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear
    ).reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const calculateCategoryExpenses = useCallback(() => {
    const categoryExp = {};
    allCategories.forEach(cat => categoryExp[cat] = 0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    transactions.filter(t =>
      t.type === 'expense' &&
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear
    ).forEach(t => {
      if (categoryExp[t.category] !== undefined) {
        categoryExp[t.category] += t.amount;
      }
    });
    return categoryExp;
  }, [transactions, allCategories]);

  const calculateCategoryAverage = useCallback((category) => {
    const categoryTransactions = transactions.filter(t => t.type === 'expense' && t.category === category);
    if (categoryTransactions.length === 0) return 0;
    const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    return total / categoryTransactions.length;
  }, [transactions]);

  const getFilteredAndSortedTransactions = useCallback(() => {
    let filtered = [...transactions];

    if (filterType !== 'all') filtered = filtered.filter(t => t.type === filterType);
    if (filterCategory !== 'all') filtered = filtered.filter(t => t.category === filterCategory);
    if (filterStartDate) filtered = filtered.filter(t => new Date(t.date) >= new Date(filterStartDate));
    if (filterEndDate) filtered = filtered.filter(t => new Date(t.date) <= new Date(filterEndDate));
    if (searchDescription) filtered = filtered.filter(t => t.description.toLowerCase().includes(searchDescription.toLowerCase()));

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (sortOrder.by === 'date') {
        return sortOrder.direction === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortOrder.by === 'amount') {
        return sortOrder.direction === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      return 0;
    });

    return filtered;
  }, [transactions, filterType, filterCategory, filterStartDate, filterEndDate, searchDescription, sortOrder]);


  // --- Dashboard Update Functions ---
  const addPitStopMessage = useCallback((message, type = 'info', syllabusLink = '#') => {
    setPitStopMessages(prevMessages => {
      const existingMessagesText = prevMessages.map(msg => msg.message.split('(למד עוד)')[0].trim());
      if (existingMessagesText.includes(message.split('(למד עוד)')[0].trim())) {
        return prevMessages; // Don't add duplicate messages
      }
      const newMessage = { id: Date.now(), message, type, syllabusLink };
      return [newMessage, ...prevMessages.slice(0, 4)]; // Keep max 5 messages
    });
  }, []);

  const earnBadge = useCallback((badgeId) => {
    const badge = allBadges.find(b => b.id === badgeId);
    if (badge && !earnedBadges.some(b => b.id === badgeId)) {
      setEarnedBadges(prev => [...prev, badge]);
      setDriverPoints(prev => prev + 50); // Points for earning a badge
      addPitStopMessage(`🎉 זכית בתג חדש: "${badge.name}"!`, 'success');
    }
  }, [earnedBadges, addPitStopMessage]);

  const addDriverPoints = useCallback((points) => {
    setDriverPoints(prev => Math.max(0, prev + points));
  }, []);

  const checkBudgetAlerts = useCallback(() => {
    // Clear previous alerts to avoid duplication, but keep general info messages
    setPitStopMessages(prevMessages => prevMessages.filter(msg => !msg.message.includes('התרעת קראש') && !msg.message.includes('האט') && !msg.message.includes('חרגת מהתקציב') && !msg.message.includes('זיהיתי הזדמנות')));

    const totalExpenses = calculateMonthlyExpenses();
    const utilization = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

    if (monthlyBudget === 0) {
      addPitStopMessage('הגדר תקציב חודשי כדי להתחיל את המרוץ! (שלב 1: בניית הרכב)', 'info', '#'); // Link to lesson 2
    } else if (utilization >= 100) {
      addPitStopMessage('התרעת קראש! חרגת מהתקציב החודשי שלך! (שלב 4: רשת ביטחון)', 'error', '#'); // Link to lesson 8
    } else if (utilization >= 80 && utilization < 100) {
      addPitStopMessage('האט! התקרבת ל-80% מהתקציב החודשי. (שלב 2: תדלוק וכיול)', 'warning', '#'); // Link to lesson 5
    }

    const categoryExpenses = calculateCategoryExpenses();
    allCategories.forEach(cat => {
      const budget = categoryBudgets[cat] || 0;
      const spent = categoryExpenses[cat] || 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;

      if (percentage >= 100 && budget > 0) {
        addPitStopMessage(`חרגת מהתקציב בקטגוריית ${cat}! (שלב 2: תדלוק וכיול)`, 'error', '#'); // Link to lesson 5
      } else if (percentage >= 80 && percentage < 100 && budget > 0) {
        addPitStopMessage(`שים לב! 80% מהתקציב ל${cat} נוצל. (שלב 2: תדלוק וכיול)`, 'warning', '#'); // Link to lesson 5
      }
    });

    // Check for saving opportunities (simplified example)
    if (totalExpenses > 500 && !pitStopMessages.some(msg => msg.message.includes('זיהיתי הזדמנות חיסכון פוטנציאלית'))) {
      addPitStopMessage('זיהיתי הזדמנות חיסכון פוטנציאלית בחשבונות התקשורת שלך! (שלב 2: תדלוק וכיול)', 'info', '#'); // Link to saving engine
    }
  }, [monthlyBudget, categoryBudgets, allCategories, calculateMonthlyExpenses, calculateCategoryExpenses, addPitStopMessage, pitStopMessages]);


  // --- Effects for data loading and saving ---
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    saveData();
    updateAllCategories(); // Ensure categories are always up-to-date
  }, [transactions, monthlyBudget, categoryBudgets, financialGoals, driverProfile, driverPoints, earnedBadges, customCategories, saveData, updateAllCategories]);

  // Effect to trigger dashboard updates when relevant state changes
  useEffect(() => {
    checkBudgetAlerts(); // Re-check alerts when data changes
  }, [transactions, monthlyBudget, categoryBudgets, checkBudgetAlerts]);

  // --- Modal Handlers ---
  const openModal = useCallback((setter) => setter(true), []);
  const closeModal = useCallback((setter) => setter(false), []);

  const handleOutsideClick = useCallback((event, modalRef, setter) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setter(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      handleOutsideClick(transactionModalRef, setIsTransactionModalOpen);
      handleOutsideClick(budgetModalRef, setIsBudgetModalOpen);
      handleOutsideClick(driverProfileModalRef, setIsDriverProfileModalOpen);
      handleOutsideClick(goalModalRef, setIsGoalModalOpen);
      handleOutsideClick(goalSelectionModalRef, setIsGoalSelectionModalOpen);
      handleOutsideClick(categoryModalRef, setIsCategoryModalOpen);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleOutsideClick]);


  // --- Form Submission Handlers ---
  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTransaction = {
      type: formData.get('transaction-type'),
      description: formData.get('transaction-description'),
      amount: parseFloat(formData.get('transaction-amount')),
      category: formData.get('transaction-type') === 'expense' ? formData.get('transaction-category') : '',
      date: formData.get('transaction-date')
    };

    if (isNaN(newTransaction.amount) || newTransaction.amount <= 0) {
      addPitStopMessage('הסכום חייב להיות מספר חיובי.', 'error');
      return;
    }

    if (editingTransaction !== null) {
      setTransactions(prev => prev.map((t, i) => i === editingTransaction.originalIndex ? newTransaction : t));
      addPitStopMessage('טרנזקציה עודכנה בהצלחה!', 'success');
      setEditingTransaction(null);
    } else {
      setTransactions(prev => [...prev, newTransaction]);
      addDriverPoints(10);
      earnBadge('first_transaction');
      addPitStopMessage('טרנזקציה נשמרה בהצלחה! המשך/י לעדכן את יומן המרוץ.', 'success');
    }
    closeModal(setIsTransactionModalOpen);
    e.target.reset();
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newMonthlyBudget = parseFloat(formData.get('monthly-budget'));
    if (isNaN(newMonthlyBudget) || newMonthlyBudget < 0) {
      addPitStopMessage('התקציב החודשי חייב להיות מספר חיובי.', 'error');
      return;
    }

    const newCategoryBudgets = {};
    allCategories.forEach(cat => {
      const budgetValue = parseFloat(formData.get(`budget-${cat}`)) || 0;
      if (isNaN(budgetValue) || budgetValue < 0) {
        addPitStopMessage(`התקציב עבור ${cat} חייב להיות מספר חיובי.`, 'error');
        newCategoryBudgets[cat] = 0;
      } else {
        newCategoryBudgets[cat] = budgetValue;
      }
    });

    if (newMonthlyBudget > 0 && monthlyBudget === 0) {
      earnBadge('budget_setter');
      addDriverPoints(25);
    }
    setMonthlyBudget(newMonthlyBudget);
    setCategoryBudgets(newCategoryBudgets);
    closeModal(setIsBudgetModalOpen);
    addPitStopMessage('התקציב נשמר בהצלחה! המסלול הוגדר.', 'success');
  };

  const handleDriverProfileSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setDriverProfile({
      type: formData.get('driver-type'),
      preferredTool: formData.get('preferred-tool'),
      reviewFrequency: formData.get('review-frequency')
    });
    closeModal(setIsDriverProfileModalOpen);
    addPitStopMessage('פרופיל הנהג שלך עודכן! המכונית מותאמת לסגנון שלך.', 'success');
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newGoal = {
      name: formData.get('goal-name'),
      targetAmount: parseFloat(formData.get('goal-amount')),
      savedAmount: parseFloat(formData.get('goal-saved')) || 0,
      dueDate: formData.get('goal-due-date')
    };

    if (isNaN(newGoal.targetAmount) || newGoal.targetAmount <= 0 || isNaN(newGoal.savedAmount) || newGoal.savedAmount < 0) {
      addPitStopMessage('סכומי היעד והחיסכון חייבים להיות מספרים חיוביים.', 'error');
      return;
    }
    if (newGoal.savedAmount > newGoal.targetAmount) {
      addPitStopMessage('הסכום שנחסך לא יכול להיות גדול מסכום היעד.', 'error');
      return;
    }

    setFinancialGoals(prev => [...prev, newGoal]);
    earnBadge('first_goal');
    addDriverPoints(30);
    closeModal(setIsGoalModalOpen);
    addPitStopMessage(`יעד חדש הוגדר: "${newGoal.name}"! קדימה אל קו הסיום!`, 'success');
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const newCatName = e.target.elements['new-category-name'].value.trim();
    if (newCatName && !allCategories.includes(newCatName)) {
      setCustomCategories(prev => [...prev, newCatName]);
      setCategoryBudgets(prev => ({ ...prev, [newCatName]: 0 })); // Initialize budget for new category
      e.target.reset();
      addPitStopMessage(`הקטגוריה "${newCatName}" נוספה בהצלחה!`, 'success');
    } else if (allCategories.includes(newCatName)) {
      addPitStopMessage('קטגוריה זו כבר קיימת.', 'warning');
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את הקטגוריה "${categoryToDelete}"? הוצאות המשויכות לקטגוריה זו לא ישונו.`)) {
      setCustomCategories(prev => prev.filter(cat => cat !== categoryToDelete));
      setCategoryBudgets(prev => {
        const newBudgets = { ...prev };
        delete newBudgets[categoryToDelete];
        return newBudgets;
      });
      addPitStopMessage(`הקטגוריה "${categoryToDelete}" נמחקה.`, 'info');
    }
  };

  // --- Render Components ---

  // Modal Component
  const Modal = ({ isOpen, onClose, children, title, modalRef }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div ref={modalRef} className="bg-[#21262d] rounded-2xl p-6 w-full max-w-md shadow-2xl relative border border-[#30363d] animate-fade-in-up">
          <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <h3 className="text-2xl font-bold mb-6 text-center text-blue-300">{title}</h3>
          {children}
        </div>
      </div>
    );
  };

  // Speedometer Component
  const Speedometer = ({ monthlyBudget, totalExpenses }) => {
    const utilization = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;
    const remaining = monthlyBudget - totalExpenses;
    const rotation = Math.min(Math.max(utilization, 0), 100) * 2.7 - 135;

    let gradientStops = '';
    if (utilization <= 50) {
      const currentGreenEnd = (utilization / 100) * 270 - 135;
      gradientStops = `#28a745 -135deg, #28a745 ${currentGreenEnd}deg, transparent ${currentGreenEnd}deg`;
    } else if (utilization <= 80) {
      const currentYellowEnd = (utilization / 100) * 270 - 135;
      gradientStops = `#28a745 -135deg, #28a745 0deg, #ffc107 0deg, #ffc107 ${currentYellowEnd}deg, transparent ${currentYellowEnd}deg`;
    } else {
      const currentRedEnd = (utilization / 100) * 270 - 135;
      gradientStops = `#28a745 -135deg, #28a745 0deg, #ffc10
