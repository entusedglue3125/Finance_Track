import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  TrendingDown, 
  TrendingUp,
  Inbox
} from 'lucide-react';
import { type Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';

// Let's fallback to standard lucide cloud icons if custom ones are not resolved.
// CloudCheck -> Cloud (or CheckCircle), CloudLightning -> CloudOff
import { Cloud, CloudOff } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  onDelete
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page when filters change
  const handleFilterChange = (updater: () => void) => {
    updater();
    setCurrentPage(1);
  };

  // Get dynamic categories list for filter dropdown
  const categoryOptions = useMemo(() => {
    if (typeFilter === 'income') {
      return INCOME_CATEGORIES.map(c => c.name);
    } else if (typeFilter === 'expense') {
      return EXPENSE_CATEGORIES.map(c => c.name);
    } else {
      return [
        ...INCOME_CATEGORIES.map(c => c.name),
        ...EXPENSE_CATEGORIES.map(c => c.name)
      ];
    }
  }, [typeFilter]);

  // Apply filters and sorting
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      } else {
        return a.amount - b.amount;
      }
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, sortBy]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="glass-card">
      <div className="list-section-header">
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} style={{ color: 'var(--color-primary)' }} />
          Transactions
        </h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing {filteredTransactions.length} of {transactions.length} records
        </span>
      </div>

      {/* Filters bar */}
      <div className="filters-wrapper">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search descriptions..."
            className="form-control"
            value={search}
            onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
          />
        </div>

        {/* Type Select */}
        <select
          className="form-control select-filter"
          value={typeFilter}
          onChange={(e) => handleFilterChange(() => {
            setTypeFilter(e.target.value as any);
            setCategoryFilter('all'); // Reset category when type changes
          })}
        >
          <option value="all">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expense Only</option>
        </select>

        {/* Category Select */}
        <select
          className="form-control select-filter"
          value={categoryFilter}
          onChange={(e) => handleFilterChange(() => setCategoryFilter(e.target.value))}
        >
          <option value="all">All Categories</option>
          {categoryOptions.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Sort Select */}
        <select
          className="form-control select-filter"
          value={sortBy}
          onChange={(e) => handleFilterChange(() => setSortBy(e.target.value as any))}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Table */}
      {paginatedTransactions.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="table-responsive desktop-only">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Sync</th>
                  {onDelete && <th style={{ textAlign: 'center' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(t.date)}</td>
                    <td>
                      <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {t.type === 'income' ? (
                          <TrendingUp size={12} style={{ marginRight: '2px' }} />
                        ) : (
                          <TrendingDown size={12} style={{ marginRight: '2px' }} />
                        )}
                        {t.type}
                      </span>
                    </td>
                    <td>{t.category}</td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description}
                    </td>
                    <td style={{ textAlign: 'right' }} className={t.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {t.synced ? (
                        <div style={{ display: 'inline-flex', color: 'var(--color-income)' }} title="Synced with Google Drive">
                          <Cloud size={18} />
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', color: 'var(--color-warning)' }} title="Stored locally in browser">
                          <CloudOff size={18} />
                        </div>
                      )}
                    </td>
                    {onDelete && (
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '4px'
                          }}
                          onClick={() => onDelete(t.id)}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-expense)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          title="Delete transaction"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-only-list">
            {paginatedTransactions.map((t) => (
              <div key={t.id} className="mobile-tx-card">
                <div className="mobile-tx-left">
                  <div className="mobile-tx-icon-wrapper">
                    <span className={`mobile-tx-badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                      {t.type === 'income' ? '+' : '-'}
                    </span>
                  </div>
                  <div className="mobile-tx-details">
                    <span className="mobile-tx-description">{t.description || t.category}</span>
                    <span className="mobile-tx-sub">{formatDate(t.date)} • {t.category}</span>
                  </div>
                </div>
                <div className="mobile-tx-right">
                  <span className={`mobile-tx-amount ${t.type === 'income' ? 'amount-income' : 'amount-expense'}`}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                  <div className="mobile-tx-actions">
                    {t.synced ? (
                      <span className="mobile-tx-sync synced" title="Synced with Google Drive">
                        <Cloud size={16} />
                      </span>
                    ) : (
                      <span className="mobile-tx-sync pending" title="Stored locally in browser">
                        <CloudOff size={16} />
                      </span>
                    )}
                    {onDelete && (
                      <button 
                        className="mobile-tx-delete-btn"
                        onClick={() => onDelete(t.id)}
                        title="Delete transaction"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <Inbox size={40} className="empty-state-icon" />
          <h3>No Transactions Found</h3>
          <p style={{ fontSize: '0.85rem' }}>No records match your filters, or you haven't added any transactions yet.</p>
        </div>
      )}
    </div>
  );
};
