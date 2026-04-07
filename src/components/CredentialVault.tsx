'use client';
import { useState } from 'react';
import { useAppStore, AppKeys } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound, LogIn, ShieldCheck, X, ChevronRight,
  RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle2, AlertTriangle, Key,
} from 'lucide-react';
import styles from './CredentialVault.module.css';

export default function CredentialVault() {
  const { apiKeys, isMockMode, setApiKeys, setMockMode, clearKeys } = useAppStore();
  const isConnected = !!apiKeys?.accessToken;

  const needsReconnect = !!apiKeys && (!apiKeys.password || !apiKeys.appName);

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'keys' | 'awaiting_token' | 'enter_token'>('keys');
  const [form, setForm] = useState({
    userKey: apiKeys?.userKey || '',
    appName: apiKeys?.appName || '', 
    appSource: apiKeys?.appSource || '', 
    encryptionKey: apiKeys?.encryptionKey || '',
    userId: apiKeys?.userId || '',
    password: apiKeys?.password || '',
  });

  // For manual direct fallback
  const [manualToken, setManualToken] = useState('');
  const [manualClientCode, setManualClientCode] = useState('');

  const [urlInput, setUrlInput] = useState('');
  const [requestToken, setRequestToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEncKey, setShowEncKey] = useState(false);

  const oauthUrl = form.userKey
    ? `https://dev-openapi.5paisa.com/WebVendorLogin/VLogin/Index?VendorKey=${form.userKey}&ResponseURL=https://www.google.com`
    : '';

  const openVault = (startStep: 'keys' | 'enter_token' = 'keys') => {
    setStep(startStep);
    setError('');
    setUrlInput('');
    setRequestToken('');
    setIsOpen(true);
  };

  const handleSaveKeys = () => {
    if (!form.userKey || !form.encryptionKey || !form.userId || !form.password || !form.appName) {
      setError('API Key, App Name, User ID, Password, and Encryption Key are all required.');
      return;
    }
    setApiKeys({ ...form, clientCode: '', accessToken: '' } as AppKeys);
    setStep('awaiting_token');
    setError('');
  };

  const handleOpenOAuth = () => {
    window.open(oauthUrl, '_blank', 'width=620,height=720');
    setStep('enter_token');
  };

  const handleUrlInput = (value: string) => {
    setUrlInput(value);
    setError('');
    try {
      const url = new URL(value.trim());
      const token = url.searchParams.get('RequestToken') || url.searchParams.get('requestToken');
      setRequestToken(token ?? '');
    } catch {
      setRequestToken('');
    }
  };

  const handleExchangeToken = async () => {
    // If they typed a manual token, use that immediately and skip OAuth
    if (manualToken.trim() && manualClientCode.trim()) {
      setApiKeys({
        ...form,
        clientCode: manualClientCode.trim(),
        accessToken: manualToken.trim(),
      } as AppKeys);
      setMockMode(false);
      setIsOpen(false);
      return;
    }

    if (!requestToken.trim()) {
      setError('No RequestToken found in URL, and no manual token provided.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/get-access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestToken: requestToken.trim(),
          userKey: form.userKey,
          encryptionKey: form.encryptionKey,
          userId: form.userId,
        }),
      });
      const data = await res.json();

      if (data?.body?.AccessToken) {
        setApiKeys({
          ...form,
          clientCode: data.body.ClientCode || form.userId,
          accessToken: data.body.AccessToken,
        } as AppKeys);
        setMockMode(false);
        setIsOpen(false);
      } else {
        setError(
          data?.body?.Message || data?.error ||
          'Token exchange failed. Ensure your keys are correct and the OAuth URL is active.'
        );
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div 
        className={styles.statusChip}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => openVault(isConnected ? 'enter_token' : 'keys')}
      >
        <div className={styles.statusDot} style={{
          background: isMockMode ? '#f59e0b' : isConnected ? '#22c55e' : '#ef4444',
          boxShadow: `0 0 10px ${isMockMode ? '#f59e0b77' : isConnected ? '#22c55e77' : '#ef444477'}`
        }} />
        <span className={styles.statusText}>
          {isMockMode ? 'Mock Mode' : isConnected ? 'Live Connection' : 'Disconnected'}
        </span>
        <KeyRound size={12} className={styles.keyIcon} />
      </motion.div>

      {needsReconnect && !isOpen && (
        <div className={styles.errorRibbon}>
          <AlertCircle size={14} />
          <span>Session Incomplete. Reconnect required.</span>
          <button onClick={() => openVault('keys')}>Fix Now</button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <Key size={22} className="accent-text" />
                  <h2>5paisa Integration</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {!!apiKeys && (
                    <button 
                      onClick={() => {
                        clearKeys();
                        setStep('keys');
                        setForm({ userKey: '', appName: 'PRIME', appSource: '27540', encryptionKey: '', userId: '', password: '' });
                      }} 
                      className={styles.secondaryBtn}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderColor: '#ef4444', color: '#ef4444', width: 'auto' }}
                    >
                      Clear Keys
                    </button>
                  )}
                  {(!isConnected && !isMockMode) && (
                    <button 
                      onClick={() => {
                        setMockMode(true);
                        setIsOpen(false);
                      }} 
                      className={styles.secondaryBtn}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', borderColor: '#f59e0b', color: '#f59e0b', width: 'auto' }}
                    >
                      Test with Mock Data
                    </button>
                  )}
                  <button className={styles.closeBtn} onClick={() => setIsOpen(false)}><X size={18} /></button>
                </div>
              </div>

              <div className={styles.steps}>
                {['API Keys', '5paisa Login', 'Paste URL'].map((label, i) => {
                  const active =
                    (step === 'keys' && i === 0) ||
                    (step === 'awaiting_token' && i === 1) ||
                    (step === 'enter_token' && i === 2);
                  return (
                    <div key={i} className={`${styles.stepItem} ${active ? styles.activeStep : ''}`}>
                      <div className={styles.stepNum}>{i + 1}</div>
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <AlertCircle size={16} /><p>{error}</p>
                </div>
              )}

              {/* ── STEP 1: Keys ── */}
              {step === 'keys' && (
                <div className={styles.formStep}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>API Key (Vendor Key)</label>
                      <input value={form.userKey} onChange={e => setForm(f => ({ ...f, userKey: e.target.value }))} placeholder="RUQ0alBGCA7j…" />
                    </div>
                    <div className={styles.field}>
                      <label>App Name</label>
                      <input value={form.appName} onChange={e => setForm(f => ({ ...f, appName: e.target.value }))} placeholder="PRIME" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>User ID</label>
                      <input value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} placeholder="vxOe8B6wi5D" />
                    </div>
                    <div className={styles.field}>
                      <label>Password (Broker Login)</label>
                      <div className={styles.passwordField}>
                        <input
                          type={showEncKey ? 'text' : 'password'}
                          value={form.password}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          placeholder="Trading Password"
                        />
                        <button type="button" onClick={() => setShowEncKey(v => !v)}>
                          {showEncKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Encryption Key</label>
                      <input type="password" value={form.encryptionKey} onChange={e => setForm(f => ({ ...f, encryptionKey: e.target.value }))} placeholder="j01Y1WFCKWMR…" />
                    </div>
                    <div className={styles.field}>
                      <label>App Source</label>
                      <input value={form.appSource} onChange={e => setForm(f => ({ ...f, appSource: e.target.value }))} placeholder="27540" />
                    </div>
                  </div>
                  <div className={styles.infoBox} style={{ marginBottom: '1.25rem', padding: '1rem', background: 'var(--accent-glow)', border: '1px solid var(--accent-soft)', color: 'var(--accent)' }}>
                    <p style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                      <strong>Onboarding:</strong> To generate your own institutional API keys, please log in to the 
                      <a href="https://xstream.5paisa.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 800, textDecoration: 'underline', margin: '0 4px' }}>
                        5paisa Xstream Dashboard
                      </a> 
                      and click on <strong>"Create App"</strong>. Use the values generated there to activate your terminal.
                    </p>
                  </div>
                  <button className={styles.primaryBtn} onClick={handleSaveKeys}>
                    Save & Continue <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* ── STEP 2: OAuth redirect ── */}
              {step === 'awaiting_token' && (
                <div className={styles.formStep}>
                  <div className={styles.infoBox}>
                    <p>Click the button below to open the <strong>5paisa secure login page</strong> in a new window.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Your Login URL</p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <code style={{
                        flex: 1, background: 'var(--surface-raised)', border: '1px solid var(--surface-border)',
                        borderRadius: 'var(--r-sm)', padding: '0.5rem 0.75rem',
                        fontSize: '11px', wordBreak: 'break-all', color: 'var(--text-secondary)',
                        fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6
                      }}>
                        {oauthUrl}
                      </code>
                      <button
                        onClick={() => { navigator.clipboard.writeText(oauthUrl); }}
                        style={{
                          background: 'var(--accent-soft)', border: '1px solid rgba(92,115,242,0.3)',
                          color: 'var(--accent)', padding: '0.5rem 0.75rem', borderRadius: 'var(--r-sm)',
                          fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <button className={styles.primaryBtn} onClick={handleOpenOAuth}>
                    <LogIn size={16} /> Open 5paisa Login
                  </button>
                  <button className={styles.secondaryBtn} onClick={() => setStep('enter_token')}>
                    I already reached the Google page →
                  </button>
                </div>
              )}

              {/* ── STEP 3: Paste URL or Manual Fallback ── */}
              {step === 'enter_token' && (
                <div className={styles.formStep}>
                  <div className={styles.infoBox}>
                    <p>If the OAuth flow worked, paste the full Google redirect URL below.</p>
                  </div>
                  <div className={styles.field}>
                    <label>Full Redirect URL</label>
                    <textarea
                      value={urlInput}
                      onChange={e => handleUrlInput(e.target.value)}
                      placeholder="https://www.google.com/?RequestToken=eyJhbGci…"
                      rows={2}
                    />
                  </div>
                  
                  {requestToken && (
                    <div className={styles.successBox}>
                      <CheckCircle2 size={16} /> Token extracted!
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--surface-divider)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--surface-divider)' }} />
                  </div>

                  <div className={styles.infoBox} style={{ background: 'var(--warn-soft)', borderColor: 'rgba(255,167,38,0.2)', color: 'var(--warn)' }}>
                    <p><strong>If the 5paisa Login URL is failing:</strong> Paste your Access Token manually from your other browser session.</p>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Client Code</label>
                      <input value={manualClientCode} onChange={e => setManualClientCode(e.target.value)} placeholder="e.g. 54509559" />
                    </div>
                    <div className={styles.field}>
                      <label>Access Token (from localStorage)</label>
                      <input value={manualToken} onChange={e => setManualToken(e.target.value)} placeholder="eyJhbGciOiJI..." />
                    </div>
                  </div>

                  <button className={styles.primaryBtn} onClick={handleExchangeToken} disabled={loading || (!requestToken && !manualToken)}>
                    {loading
                      ? <><RefreshCw size={16} className={styles.spin} /> Verifying…</>
                      : <><ShieldCheck size={16} /> Connect & Load Portfolio</>
                    }
                  </button>
                  <button className={styles.secondaryBtn} onClick={() => setStep('awaiting_token')}>← Back</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
