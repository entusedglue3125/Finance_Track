import React, { useState } from 'react';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Info,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import type { GoogleCredentials } from '../types';

interface SignInProps {
  credentials: GoogleCredentials;
  onSaveCredentials: (creds: GoogleCredentials) => void;
  onConnect: () => void;
  onContinueOffline: () => void;
  isLoading: boolean;
  error?: string;
}

export const SignIn: React.FC<SignInProps> = ({
  credentials,
  onSaveCredentials,
  onConnect,
  onContinueOffline,
  isLoading,
  error
}) => {
  const [clientId, setClientId] = useState(credentials.clientId || '');
  const [showConfig, setShowConfig] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    onSaveCredentials({ clientId: clientId.trim() });
    setTimeout(() => {
      setIsSaving(false);
      setShowConfig(false);
    }, 800);
  };

  return (
    <div className="signin-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.08), transparent 40%), #0b0f19',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'rgba(99, 102, 241, 0.08)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '400px', height: '400px', background: 'rgba(16, 185, 129, 0.05)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="glass-card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '40px 32px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Settings Icon Toggle */}
        <button 
          onClick={() => setShowConfig(!showConfig)}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: showConfig ? 'var(--color-primary)' : 'var(--text-secondary)',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title="Configure Google Client ID"
        >
          <Settings size={18} />
        </button>

        {/* Animated App Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-income))',
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '8px', background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          WealthFlow
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' }}>
          Secure, serverless finance tracking synced directly to your Google Sheets.
        </p>

        {error && (
          <div style={{
            background: 'var(--color-expense-bg)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: 'var(--color-expense)',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        {/* Main Connect / Sign-In Interface */}
        {!showConfig ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {credentials.clientId ? (
              <>
                <button 
                  onClick={onConnect} 
                  className="btn btn-primary"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                    cursor: 'pointer'
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      {/* Google SVG Icon */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      Sign In with Google
                    </>
                  )}
                </button>
                <button 
                  onClick={onContinueOffline}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '0.9rem' }}
                >
                  Continue Offline (Local Mode)
                </button>
              </>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255,255,255,0.1)',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}><Info size={24} style={{ color: 'var(--color-primary)' }} /></div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Client ID Required</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  A Google OAuth Client ID is required to secure authentication directly from your domain origin.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <button 
                    onClick={onContinueOffline}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Continue Offline (Local Mode)
                  </button>
                  <button 
                    onClick={() => setShowConfig(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    Configure Client ID
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} style={{ color: 'var(--color-income)' }} /> Direct OAuth2 Flow</span>
              <span style={{ opacity: 0.3 }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Sparkles size={14} style={{ color: 'var(--color-primary)' }} /> Zero Server Database</span>
            </div>
          </div>
        ) : (
          /* Client ID configuration form */
          <div style={{ textAlign: 'left', animation: 'fadeIn 0.2s ease-out' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} style={{ color: 'var(--color-primary)' }} />
              OAuth Configuration
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="client-id-input" style={{ fontSize: '0.8rem' }}>Google Client ID</label>
                <input
                  id="client-id-input"
                  type="text"
                  placeholder="e.g., xxxxxxxxxx-xxxxxxxxxx.apps.googleusercontent.com"
                  className="form-control"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setShowConfig(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </form>

            {/* Instruction Accordion */}
            <div style={{ marginTop: '16px' }}>
              <button 
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.75rem', background: 'rgba(255,255,255,0.01)' }}
                onClick={() => setShowGuide(!showGuide)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} />
                  How to get a Client ID?
                </span>
                {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showGuide && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '12px 16px', 
                  background: 'rgba(15, 23, 42, 0.4)', 
                  border: '1px solid rgba(255,255,255,0.05)', 
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  lineHeight: '1.5',
                  color: 'var(--text-secondary)',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  <ol style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li>Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Google Cloud Console</a>.</li>
                    <li>Create a new project.</li>
                    <li>Search for <strong>"Google Sheets API"</strong> and <strong>"Google Drive API"</strong> and click Enable on both.</li>
                    <li>Go to <strong>OAuth Consent Screen</strong>:
                      <ul style={{ paddingLeft: '12px', listStyleType: 'circle', marginTop: '4px' }}>
                        <li>Set User Type to <strong>External</strong>.</li>
                        <li>Add scopes: <code>.../auth/spreadsheets</code> and <code>.../auth/drive.file</code>.</li>
                        <li>Add your Gmail address under <strong>Test Users</strong> (important for draft apps).</li>
                      </ul>
                    </li>
                    <li>Go to <strong>Credentials</strong> &gt; <strong>Create Credentials</strong> &gt; <strong>OAuth Client ID</strong>:
                      <ul style={{ paddingLeft: '12px', listStyleType: 'circle', marginTop: '4px' }}>
                        <li>Application Type: <strong>Web application</strong>.</li>
                        <li>Under <strong>Authorized JavaScript origins</strong> add:
                          <br />- <code>http://localhost:5173</code> (local)
                          <br />- <code>https://wealthflow-finance-tracker.netlify.app</code> (production)
                        </li>
                      </ul>
                    </li>
                    <li>Click Save and copy the <strong>Client ID</strong> into the form above.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
