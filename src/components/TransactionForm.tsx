import React, { useState, useEffect } from 'react';
import { X, PlusCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { 
  type Transaction, 
  INCOME_CATEGORIES, 
  EXPENSE_CATEGORIES 
} from '../types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactionData: Omit<Transaction, 'id' | 'synced'>) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset states when form opens/closes
  useEffect(() => {
    if (isOpen) {
      setType('expense');
      setAmount('');
      // Set default category to the first one in the list
      setCategory(EXPENSE_CATEGORIES[0].name);
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setErrors({});
    }
  }, [isOpen]);

  // Update default category when type changes
  useEffect(() => {
    if (type === 'income') {
      setCategory(INCOME_CATEGORIES[0].name);
    } else {
      setCategory(EXPENSE_CATEGORIES[0].name);
    }
  }, [type]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    }
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    if (!date) {
      newErrors.date = 'Please select a date';
    }
    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      date,
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category
    });
    
    onClose();
  };

  const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={22} style={{ color: 'var(--color-primary)' }} />
            Add Transaction
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close form">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Transaction Type Select */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="radio-group">
              <div 
                className={`radio-card ${type === 'expense' ? 'expense-active' : ''}`}
                onClick={() => setType('expense')}
              >
                <ArrowDownCircle size={18} />
                <span>Expense</span>
              </div>
              <div 
                className={`radio-card ${type === 'income' ? 'income-active' : ''}`}
                onClick={() => setType('income')}
              >
                <ArrowUpCircle size={18} />
                <span>Income</span>
              </div>
            </div>
          </div>

          <div className="form-row">
            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="amount-input">Amount (₹)</label>
              <input
                id="amount-input"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {errors.amount && <span style={{ fontSize: '0.75rem', color: 'var(--color-expense)' }}>{errors.amount}</span>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="date-input">Date</label>
              <input
                id="date-input"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <span style={{ fontSize: '0.75rem', color: 'var(--color-expense)' }}>{errors.date}</span>}
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="category-select">Category</label>
            <select
              id="category-select"
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {activeCategories.map((cat) => (
                <option key={cat.name} value={cat.name} style={{ backgroundColor: 'var(--bg-main)' }}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <span style={{ fontSize: '0.75rem', color: 'var(--color-expense)' }}>{errors.category}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description-input">Description / Note</label>
            <input
              id="description-input"
              type="text"
              placeholder="e.g., Grocery at store, Monthly Salary"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
            />
            {errors.description && <span style={{ fontSize: '0.75rem', color: 'var(--color-expense)' }}>{errors.description}</span>}
          </div>

          {/* Submit buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn ${type === 'income' ? 'btn-income' : 'btn-expense'}`}
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
