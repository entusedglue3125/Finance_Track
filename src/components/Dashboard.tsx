import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { type Transaction, EXPENSE_CATEGORIES } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  // Calculations
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  }, [transactions]);

  // Chart 1: Monthly Income vs Expenses (Last 6 Months)
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { month: string; income: number; expense: number; timestamp: number }> = {};
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthsMap[key] = {
        month: key,
        income: 0,
        expense: 0,
        timestamp: d.getTime()
      };
    }

    // Populate data
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const key = tDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthsMap[key]) {
        if (t.type === 'income') {
          monthsMap[key].income += t.amount;
        } else {
          monthsMap[key].expense += t.amount;
        }
      }
    });

    return Object.values(monthsMap).sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions]);

  // Chart 2: Expense Category Breakdown
  const categoryData = useMemo(() => {
    const breakdown: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      });

    return Object.entries(breakdown).map(([name, value]) => {
      // Find color from configuration or default to grey
      const catConfig = EXPENSE_CATEGORIES.find(c => c.name === name);
      return {
        name,
        value,
        color: catConfig ? catConfig.color : '#9ca3af'
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const hasExpenses = categoryData.length > 0;
  const hasTransactions = transactions.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Cards Row */}
      <div className="dashboard-grid">
        {/* Balance Card */}
        <div className="glass-card glass-card-hover stat-card">
          <div className="stat-header">
            <span>Net Balance</span>
            <div className="stat-icon-wrapper balance">
              <Wallet size={20} />
            </div>
          </div>
          <div>
            <div className="stat-val" style={{ color: stats.balance >= 0 ? 'var(--text-primary)' : 'var(--color-expense)' }}>
              {formatCurrency(stats.balance)}
            </div>
            <div className="stat-desc">
              <Activity size={12} />
              <span>Current wealth status</span>
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="glass-card glass-card-hover stat-card">
          <div className="stat-header">
            <span>Total Earnings</span>
            <div className="stat-icon-wrapper income">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <div className="stat-val" style={{ color: 'var(--color-income)' }}>
              {formatCurrency(stats.totalIncome)}
            </div>
            <div className="stat-desc">
              <span>+ Cash inflow</span>
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="glass-card glass-card-hover stat-card">
          <div className="stat-header">
            <span>Total Expenses</span>
            <div className="stat-icon-wrapper expense">
              <TrendingDown size={20} />
            </div>
          </div>
          <div>
            <div className="stat-val" style={{ color: 'var(--color-expense)' }}>
              {formatCurrency(stats.totalExpense)}
            </div>
            <div className="stat-desc">
              <span>- Cash outflow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      {hasTransactions ? (
        <div className="charts-grid">
          {/* Monthly Trend Area Chart */}
          <div className="glass-card chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Income vs Expenses Trend</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last 6 Months</span>
            </div>
            <div className="chart-container-inner">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--text-muted)" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.85rem'
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600 }}
                    formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    name="Income"
                    stroke="var(--color-income)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#incomeGrad)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    name="Expense"
                    stroke="var(--color-expense)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#expenseGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="glass-card chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Expense Breakdown</h3>
              <PieIcon size={18} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div className="chart-container-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {hasExpenses ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          borderColor: 'var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.85rem'
                        }}
                        formatter={(value: any) => [formatCurrency(Number(value)), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend list */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px', 
                    justifyContent: 'center', 
                    marginTop: '12px',
                    maxHeight: '80px',
                    overflowY: 'auto',
                    width: '100%',
                    fontSize: '0.75rem'
                  }}>
                    {categoryData.slice(0, 5).map((entry, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }}></span>
                        <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
                      </div>
                    ))}
                    {categoryData.length > 5 && (
                      <div style={{ color: 'var(--text-muted)' }}>+{categoryData.length - 5} more</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <span style={{ fontSize: '0.85rem' }}>No expenses logged yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
          <DollarSign size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.4 }} />
          <h3>No Financial Data Available</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '6px' }}>Click "Add Transaction" to log your first income or expense!</p>
        </div>
      )}
    </div>
  );
};
