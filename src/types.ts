export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  synced: boolean;
}

export interface GoogleCredentials {
  clientId: string;
}

export interface SyncStatus {
  connected: boolean;
  syncing: boolean;
  lastSynced?: string;
  error?: string;
  userEmail?: string;
  userName?: string;
  userPicture?: string;
  accessToken?: string;
  expiresAt?: number;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
}

export type CategoryType = 'income' | 'expense';

export interface CategoryInfo {
  name: string;
  color: string;
}

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { name: 'Salary', color: '#10b981' },
  { name: 'Freelance / Side Gig', color: '#34d399' },
  { name: 'Investments', color: '#60a5fa' },
  { name: 'Gifts / Grants', color: '#f472b6' },
  { name: 'Refunds / Others', color: '#a78bfa' }
];

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { name: 'Housing & Utilities', color: '#f43f5e' },
  { name: 'Food & Dining', color: '#fb7185' },
  { name: 'Transportation', color: '#fb923c' },
  { name: 'Entertainment & Leisure', color: '#f472b6' },
  { name: 'Shopping', color: '#38bdf8' },
  { name: 'Healthcare & Insurance', color: '#2dd4bf' },
  { name: 'Education', color: '#60a5fa' },
  { name: 'Others', color: '#9ca3af' }
];
