import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  PlusCircle, 
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import type { Transaction, GoogleCredentials, SyncStatus } from './types';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { GoogleSyncSettings } from './components/GoogleSyncSettings';
import { SignIn } from './components/SignIn';
import { 
  requestGoogleAuthToken, 
  findOrCreateSpreadsheet, 
  fetchTransactionsFromSheet, 
  appendTransactionsToSheet 
} from './services/googleSheets';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'settings'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credentials, setCredentials] = useState<GoogleCredentials>({ 
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '' 
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ connected: false, syncing: false });
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // 1. Initial Load Session
  useEffect(() => {
    // Load local transactions
    const localTx = localStorage.getItem('wealthflow_transactions');
    if (localTx) {
      setTransactions(JSON.parse(localTx));
    }

    // Load credentials
    const localCreds = localStorage.getItem('wealthflow_credentials');
    if (localCreds) {
      setCredentials(JSON.parse(localCreds));
    }

    // Load sync status / session
    const localSyncStatus = localStorage.getItem('wealthflow_sync_status');
    if (localSyncStatus) {
      const parsedStatus: SyncStatus = JSON.parse(localSyncStatus);
      // Verify token expiration
      if (parsedStatus.expiresAt && parsedStatus.expiresAt > Date.now()) {
        setSyncStatus(parsedStatus);
      } else {
        // Expired session: log out
        localStorage.removeItem('wealthflow_sync_status');
      }
    }
  }, []);

  // Save credentials helper
  const handleSaveCredentials = (newCreds: GoogleCredentials) => {
    setCredentials(newCreds);
    localStorage.setItem('wealthflow_credentials', JSON.stringify(newCreds));
  };

  // Google OAuth Authorization & Sheet Setup
  const handleConnect = async () => {
    if (!credentials.clientId) return;
    setIsLoadingAuth(true);
    setSyncStatus(prev => ({ ...prev, error: undefined }));

    try {
      // 1. Trigger Google Identity Services Login Popup
      const authData = await requestGoogleAuthToken(credentials.clientId);
      
      if (!authData.accessToken) {
        throw new Error('No access token returned from Google.');
      }

      // 2. Drive Search or Create sheet
      const sheetInfo = await findOrCreateSpreadsheet(authData.accessToken);
      
      const newStatus: SyncStatus = {
        connected: true,
        syncing: false,
        accessToken: authData.accessToken,
        expiresAt: authData.expiresAt,
        userEmail: authData.email,
        userName: authData.name,
        userPicture: authData.picture,
        spreadsheetId: sheetInfo.spreadsheetId,
        spreadsheetUrl: sheetInfo.url,
        lastSynced: new Date().toLocaleTimeString(),
        error: undefined
      };

      setSyncStatus(newStatus);
      localStorage.setItem('wealthflow_sync_status', JSON.stringify(newStatus));

      // 3. Sync initial records
      await handleSync(credentials, newStatus);
    } catch (err: any) {
      setSyncStatus({
        connected: false,
        syncing: false,
        error: err.message || 'Authorization failed. Please verify your Client ID and test user permissions.'
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Disconnect Google Drive
  const handleDisconnect = () => {
    localStorage.removeItem('wealthflow_sync_status');
    
    // Convert local transactions to unsynced status
    const updatedTx = transactions.map(t => ({ ...t, synced: false }));
    setTransactions(updatedTx);
    localStorage.setItem('wealthflow_transactions', JSON.stringify(updatedTx));

    setSyncStatus({
      connected: false,
      syncing: false,
      error: undefined
    });
    setIsOfflineMode(false);
  };

  // Sync Local data with Google Drive Sheet
  const handleSync = async (_creds = credentials, currentStatus = syncStatus) => {
    if (!currentStatus.connected || !currentStatus.accessToken || !currentStatus.spreadsheetId) return;

    setSyncStatus(prev => ({ ...prev, syncing: true, error: undefined }));

    try {
      // Verify token expiration
      if (currentStatus.expiresAt && currentStatus.expiresAt <= Date.now()) {
        throw new Error('Google session expired. Please sign in again.');
      }

      // 1. Fetch current rows from sheet
      await fetchTransactionsFromSheet(currentStatus.spreadsheetId, currentStatus.accessToken);

      // 2. Identify local transactions that aren't synced
      const unsyncedTx = transactions.filter(t => !t.synced);

      // 3. Append unsynced records to Google sheet if there are any
      if (unsyncedTx.length > 0) {
        await appendTransactionsToSheet(currentStatus.spreadsheetId, unsyncedTx, currentStatus.accessToken);
      }

      // 4. Reload all transactions from Google Sheet to get a clean unified database
      const refreshedTx = await fetchTransactionsFromSheet(currentStatus.spreadsheetId, currentStatus.accessToken);
      
      // Update local storage and state
      setTransactions(refreshedTx);
      localStorage.setItem('wealthflow_transactions', JSON.stringify(refreshedTx));

      const updatedStatus = {
        ...currentStatus,
        syncing: false,
        lastSynced: new Date().toLocaleTimeString(),
        error: undefined
      };
      setSyncStatus(updatedStatus);
      localStorage.setItem('wealthflow_sync_status', JSON.stringify(updatedStatus));
    } catch (err: any) {
      if (err.message && err.message.includes('expired')) {
        handleDisconnect();
      } else {
        setSyncStatus(prev => ({
          ...prev,
          syncing: false,
          error: err.message || 'Sync failed.'
        }));
      }
    }
  };

  // Add new Income or Expense transaction
  const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'synced'>) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      ...data,
      synced: false
    };

    // 1. Save locally first
    const updatedList = [newTx, ...transactions];
    setTransactions(updatedList);
    localStorage.setItem('wealthflow_transactions', JSON.stringify(updatedList));

    // 2. If connected, attempt sync in the background
    if (syncStatus.connected && syncStatus.accessToken && syncStatus.spreadsheetId) {
      try {
        await appendTransactionsToSheet(syncStatus.spreadsheetId, [newTx], syncStatus.accessToken);
        // Mark as synced on success
        const markedList = updatedList.map(t => t.id === newTx.id ? { ...t, synced: true } : t);
        setTransactions(markedList);
        localStorage.setItem('wealthflow_transactions', JSON.stringify(markedList));
      } catch (err) {
        console.warn('Background sheet sync failed. Item will sync on next refresh.', err);
      }
    }
  };

  // Delete transaction locally
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('wealthflow_transactions', JSON.stringify(updated));
  };

  // Reset local storage
  const handleResetLocalData = () => {
    localStorage.removeItem('wealthflow_transactions');
    setTransactions([]);
    localStorage.setItem('wealthflow_transactions', JSON.stringify([]));
    if (syncStatus.connected) {
      handleDisconnect();
    } else {
      setIsOfflineMode(false);
    }
  };

  // Export local database to a JSON file
  const handleExportLocalData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `wealthflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Conditional Rendering: If not connected and not running in offline mode, show Sign-In
  if (!syncStatus.connected && !isOfflineMode) {
    return (
      <SignIn
        credentials={credentials}
        onSaveCredentials={handleSaveCredentials}
        onConnect={handleConnect}
        onContinueOffline={() => setIsOfflineMode(true)}
        isLoading={isLoadingAuth}
        error={syncStatus.error}
      />
    );
  }

  return (
    <>
      {/* Premium Navigation Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo" onClick={() => setActiveTab('dashboard')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>WealthFlow</span>
          </div>

          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              <span className="nav-text">Dashboard</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              <TrendingDown size={18} />
              <span className="nav-text">History</span>
            </button>
            <button 
              className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <SettingsIcon size={18} />
              <span className="nav-text">Settings</span>
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {syncStatus.connected ? (
              <span 
                className="sync-badge connected sync-badge-mobile-icon" 
                style={{ cursor: 'pointer', padding: '6px 12px' }}
                onClick={() => handleSync()}
                title={`Last synced: ${syncStatus.lastSynced || 'N/A'}. Click to sync.`}
              >
                <RefreshCw size={12} className={syncStatus.syncing ? 'animate-spin' : ''} />
                <span className="sync-badge-text-desktop">Synced</span>
              </span>
            ) : (
              <span 
                className="sync-badge offline sync-badge-mobile-icon" 
                style={{ 
                  cursor: 'pointer', 
                  padding: '6px 12px',
                  background: 'rgba(251, 188, 5, 0.1)',
                  color: '#fbbc05',
                  border: '1px solid rgba(251, 188, 5, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => setActiveTab('settings')}
                title="Running in Local Offline Mode. Click to link Google Drive in settings."
              >
                <RefreshCw size={12} />
                <span className="sync-badge-text-desktop">Local Mode</span>
              </span>
            )}

            <button className="btn btn-primary btn-sm btn-icon-only-mobile" onClick={() => setIsFormOpen(true)}>
              <PlusCircle size={16} />
              <span className="btn-text-desktop">Add Transaction</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container">
        {activeTab === 'dashboard' && <Dashboard transactions={transactions} />}
        {activeTab === 'transactions' && (
          <TransactionList 
            transactions={transactions} 
            onDelete={handleDeleteTransaction}
          />
        )}
        {activeTab === 'settings' && (
          <GoogleSyncSettings
            credentials={credentials}
            syncStatus={syncStatus}
            onSaveCredentials={handleSaveCredentials}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
            onResetLocalData={handleResetLocalData}
            onExportLocalData={handleExportLocalData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container" style={{ padding: '0 16px' }}>
          WealthFlow | Personal Finance Tracker with secure, serverless Google Drive Synchronization.
          <br />
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
            All financial data stays strictly inside your browser and your Google account.
          </span>
        </div>
      </footer>

      {/* Add Transaction Dialog */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleAddTransaction}
      />

      {/* Floating Bottom Tab Navigation Bar for Mobile */}
      <nav className="mobile-nav-bar">
        <button 
          className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
        <button 
          className={`mobile-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <TrendingDown size={20} />
          <span>History</span>
        </button>
        <button 
          className={`mobile-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </button>
      </nav>
    </>
  );
}

export default App;
