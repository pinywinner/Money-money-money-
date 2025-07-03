import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { Transaction } from '../context/FinancialContext';
import NeumorphicCard from '../components/ui/NeumorphicCard';
import NeumorphicButton from '../components/ui/NeumorphicButton';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const TransactionJournal = () => {
  const { state, dispatch } = useFinancial();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = state.transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        ...transaction,
        id: Date.now().toString()
      }
    });
    setShowAddModal(false);
  };

  const handleUpdateTransaction = (transaction: Transaction) => {
    dispatch({
      type: 'UPDATE_TRANSACTION',
      payload: transaction
    });
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    dispatch({
      type: 'DELETE_TRANSACTION',
      payload: id
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          יומן עסקאות
        </h1>
        <NeumorphicButton onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 ml-2" />
          עסקה חדשה
        </NeumorphicButton>
      </div>

      {/* Search and Filter */}
      <NeumorphicCard>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="חיפוש עסקאות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-gray-50 rounded-lg shadow-inner-neu focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterType === 'all' 
                  ? 'shadow-inner-neu bg-blue-50 text-blue-600' 
                  : 'shadow-neu bg-gray-100 text-gray-600 hover:shadow-neu-hover'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterType === 'income' 
                  ? 'shadow-inner-neu bg-green-50 text-green-600' 
                  : 'shadow-neu bg-gray-100 text-gray-600 hover:shadow-neu-hover'
              }`}
            >
              הכנסות
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterType === 'expense' 
                  ? 'shadow-inner-neu bg-red-50 text-red-600' 
                  : 'shadow-neu bg-gray-100 text-gray-600 hover:shadow-neu-hover'
              }`}
            >
              הוצאות
            </button>
          </div>
        </div>
      </NeumorphicCard>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.map(transaction => (
          <NeumorphicCard key={transaction.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {transaction.description}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {transaction.category} • {format(transaction.date, 'dd/MM/yyyy', { locale: he })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('he-IL')} ₪
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingTransaction(transaction)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </NeumorphicCard>
        ))}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <TransactionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTransaction}
          categories={state.categories}
        />
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleUpdateTransaction}
          categories={state.categories}
        />
      )}
    </div>
  );
};

// Transaction Modal Component
interface TransactionModalProps {
  transaction?: Transaction;
  onClose: () => void;
  onSave: (transaction: Transaction | Omit<Transaction, 'id'>) => void;
  categories: any[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  transaction,
  onClose,
  onSave,
  categories
}) => {
  const [formData, setFormData] = useState({
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    category: transaction?.category || '',
    type: transaction?.type || 'expense' as 'income' | 'expense',
    date: transaction?.date || new Date()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction) {
      onSave({ ...transaction, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 shadow-neu rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {transaction ? 'עריכת עסקה' : 'עסקה חדשה'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סכום
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-50 shadow-inner-neu rounded-lg focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תיאור
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 shadow-inner-neu rounded-lg focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              קטגוריה
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 shadow-inner-neu rounded-lg focus:outline-none"
              required
            >
              <option value="">בחר קטגוריה</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סוג
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                  formData.type === 'expense'
                    ? 'shadow-inner-neu bg-red-50 text-red-600'
                    : 'shadow-neu bg-gray-100 text-gray-600'
                }`}
              >
                הוצאה
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                  formData.type === 'income'
                    ? 'shadow-inner-neu bg-green-50 text-green-600'
                    : 'shadow-neu bg-gray-100 text-gray-600'
                }`}
              >
                הכנסה
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <NeumorphicButton
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              ביטול
            </NeumorphicButton>
            <NeumorphicButton
              type="submit"
              variant="primary"
              className="flex-1"
            >
              שמירה
            </NeumorphicButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionJournal;