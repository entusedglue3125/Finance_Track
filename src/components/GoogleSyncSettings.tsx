import React, { useState } from 'react';
import { 
  Cloud, 
  Settings, 
  RefreshCw, 
  Database, 
  Trash2, 
  Download, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  User,
  LogOut
} from 'lucide-react';
import type { GoogleCredentials, SyncStatus } from '../types';

interface GoogleSyncSettingsProps {
  credentials: GoogleCredentials;
  syncStatus: SyncStatus;
  onSaveCredentials: (creds: GoogleCredentials) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  onResetLocalData: () => void;
  onExportLocalData: () => void;
}

export const GoogleSyncSettings: React.FC<GoogleSyncSettingsProps> = ({
  credentials,
  syncStatus,
  onSaveCredentials,
  onDisconnect,
  onSync,
  onResetLocalData,
  onExportLocalData
}) => {
  const [clientId, setClientId] = useState(credentials.clientId || '');
  const [showGuide, setShowGuide] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    onSaveCredentials({
      clientId: clientId.trim()
    });
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Connection Status Card */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cloud size={20} style={{ color: 'var(--color-primary)' }} />
          Sync Connection
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {syncStatus.connected ? (
            <div className="sync-connection-card">
              {/* User Avatar */}
              {syncStatus.userPicture ? (
                <img 
                  src={syncStatus.userPicture} 
                  alt="Avatar" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--color-primary)' }} 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'rgba(99,102,241,0.1)', 
                  color: 'var(--color-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <User size={24} />
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {syncStatus.userName || 'Authenticated User'}
                  <span className="sync-badge connected" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Connected</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {syncStatus.userEmail || 'Google Drive Sync Enabled'}
                </div>
              </div>

              <button className="btn btn-secondary btn-sm" onClick={onDisconnect} style={{ color: 'var(--color-expense)', borderColor: 'rgba(244,63,94,0.1)' }}>
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>You are not signed in. Log in to synchronize your data.</p>
            </div>
          )}

          {syncStatus.error && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--color-expense-bg)', 
              border: '1px solid rgba(244,63,94,0.2)',
              color: 'var(--color-expense)',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div><strong>Sync Error:</strong> {syncStatus.error}</div>
            </div>
          )}

          {/* Sync Stats & Live Sheet Link */}
          {syncStatus.connected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem' }}>
              {syncStatus.spreadsheetUrl && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Google Sheet:</span>
                  <a 
                    href={syncStatus.spreadsheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    Open Google Sheet
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Sync Action:</span>
                <span>{syncStatus.lastSynced ? syncStatus.lastSynced : 'Not synced yet'}</span>
              </div>
            </div>
          )}

          {syncStatus.connected && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                onClick={onSync} 
                disabled={syncStatus.syncing}
                style={{ flex: 1 }}
              >
                <RefreshCw size={16} className={syncStatus.syncing ? 'animate-spin' : ''} style={{ animation: syncStatus.syncing ? 'spin 1.5s linear infinite' : 'none' }} />
                {syncStatus.syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Client ID Config Card */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={20} style={{ color: 'var(--color-primary)' }} />
          Google API Settings
        </h2>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="client-id-settings">Google OAuth Client ID</label>
            <input
              id="client-id-settings"
              type="text"
              placeholder="e.g., xxxxxxxxxx-xxxxxxxxxx.apps.googleusercontent.com"
              className="form-control"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={syncStatus.connected}
              required
            />
          </div>

          {!syncStatus.connected && (
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Update Client ID'}
            </button>
          )}
        </form>

        <div style={{ marginTop: '20px' }}>
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)' }}
            onClick={() => setShowGuide(!showGuide)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} />
              Setup Guide: How to configure Google API?
            </span>
            {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showGuide && (
            <div className="setup-guide" style={{ animation: 'fadeIn 0.2s ease-out', padding: '16px', background: 'rgba(15,23,42,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <ol style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Google Cloud Console</a>.</li>
                <li>Create a project.</li>
                <li>Enable the <strong>Google Sheets API</strong> and <strong>Google Drive API</strong>.</li>
                <li>Set up the **OAuth Consent Screen** (User Type: External). Add scopes: <code>.../auth/spreadsheets</code> and <code>.../auth/drive.file</code>. Add your login email as a <strong>Test User</strong>.</li>
                <li>Go to **Credentials** &gt; **Create Credentials** &gt; **OAuth client ID** (Web application).</li>
                <li>Under **Authorized JavaScript origins**, click Add URI and enter:
                  <br />- <code>http://localhost:5173</code> (local development)
                  <br />- <code>https://wealthflow-finance-tracker.netlify.app</code> (production Netlify)
                </li>
                <li>Save and paste the generated Client ID in the input box above.</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* 3. Maintenance / Local Data Controls */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={20} style={{ color: 'var(--color-primary)' }} />
          Local Data Maintenance
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onExportLocalData}>
            <Download size={16} />
            Export Local Data (JSON)
          </button>
          
          <button 
            className="btn btn-secondary" 
            style={{ borderColor: 'rgba(244,63,94,0.15)', color: 'var(--color-expense)' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all local transactions? This cannot be undone.')) {
                onResetLocalData();
              }
            }}
          >
            <Trash2 size={16} />
            Reset Local Storage
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};
