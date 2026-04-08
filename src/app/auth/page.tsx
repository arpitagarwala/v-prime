'use client';
import { useState } from 'react';
import { supabase, getDeviceId } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Monitor, ShieldCheck, AlertCircle, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const INVITE_CODE = process.env.NEXT_PUBLIC_INVITE_CODE || 'VPRIME2026';
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'arpitagarwalms@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const deviceId = getDeviceId();

    try {
      if (isSignup) {
        // --- SIGNUP with Invite Code ---
        if (inviteCode.trim().toUpperCase() !== INVITE_CODE.toUpperCase()) {
          throw new Error('INVALID INVITE CODE. CONTACT ADMIN FOR EARLY ACCESS.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            authorized_device_id: deviceId,
            is_admin: email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
          });
          // Auto sign-in after signup (email confirmation disabled)
          await supabase.auth.signInWithPassword({ email, password });
          router.push('/');
        } else {
          setSuccess('Account created! You can now sign in.');
          setIsSignup(false);
          setPassword('');
          setInviteCode('');
        }
      } else {
        // --- LOGIN ---
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        if (!isAdmin) {
          try {
            const { data: profile } = await supabase
              .from('profiles').select('authorized_device_id').eq('id', data.user.id).single();

            if (profile?.authorized_device_id && profile.authorized_device_id !== deviceId) {
              await supabase.auth.signOut();
              throw new Error('UNAUTHORIZED DEVICE — THIS ACCOUNT IS LOCKED TO ANOTHER MACHINE. CONTACT ADMIN TO RESET.');
            }
          } catch (profileErr: any) {
            if (profileErr.message?.includes('UNAUTHORIZED')) throw profileErr;
          }
        }

        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#040405',
      color: '#fff',
      fontFamily: '"Outfit", sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '45%', height: '45%', background: 'radial-gradient(circle, rgba(92,115,242,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '45%', height: '45%', background: 'radial-gradient(circle, rgba(46,213,115,0.07) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2.5rem',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '28px',
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
          zIndex: 10
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '48px', height: '48px',
            background: 'rgba(92,115,242,0.1)',
            border: '1px solid rgba(92,115,242,0.2)',
            borderRadius: '16px', marginBottom: '1.25rem', color: '#5c73f2'
          }}>
            <Monitor size={22} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#fff', marginBottom: '0' }}>
            V-PRIME <span style={{ color: '#5c73f2' }}>ACCESS</span>
          </h1>
          <div style={{ height: '1px', width: '36px', background: '#5c73f2', margin: '0.75rem auto 0', opacity: 0.5 }} />
        </div>

        {/* Mode Toggle Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', marginBottom: '1.75rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          {['Sign In', 'Apply Now'].map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setIsSignup(i === 1); setError(''); setSuccess(''); }}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: '9px', border: 'none', cursor: 'pointer',
                background: isSignup === (i === 1) ? 'rgba(92,115,242,0.2)' : 'transparent',
                color: isSignup === (i === 1) ? '#5c73f2' : 'rgba(255,255,255,0.35)',
                fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', padding: '0.7rem 0.9rem', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={13} style={{ marginTop: '1px', flexShrink: 0 }} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'rgba(46,213,115,0.06)', border: '1px solid rgba(46,213,115,0.2)', color: '#2ed573', padding: '0.7rem 0.9rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={13} /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={labelStyle}>Operator Identity</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" style={inputStyle} />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={labelStyle}>Encrypted Key</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>

          {/* Invite Code — only on signup */}
          <AnimatePresence>
            {isSignup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
              >
                <label style={labelStyle}>Early Access Code</label>
                <input
                  type="text"
                  required={isSignup}
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                  placeholder="VPRIME****"
                  style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}
                />
                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                  Access code provided by admin. Case-insensitive.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            background: loading ? 'rgba(92,115,242,0.5)' : '#5c73f2',
            color: '#fff', padding: '0.95rem', borderRadius: '14px',
            fontWeight: 900, fontSize: '0.75rem', cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none', marginTop: '0.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            boxShadow: loading ? 'none' : '0 8px 24px -6px rgba(92,115,242,0.45)',
            transition: 'all 0.25s ease'
          }}>
            {loading
              ? <Loader2 size={15} className="spin" />
              : isSignup
                ? <><UserPlus size={16} /> Apply for Access</>
                : <><ShieldCheck size={16} /> Enter Terminal</>
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.58rem', color: 'rgba(255,255,255,0.15)', fontWeight: 700, letterSpacing: '0.06em', marginTop: '2rem' }}>
          SYSTEM CLASSIFIED // AUTHORIZED PERSONNEL ONLY
        </p>
      </motion.div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 0.8s linear infinite; }
        input:focus {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(92,115,242,0.4) !important;
          box-shadow: 0 0 0 3px rgba(92,115,242,0.08) !important;
          outline: none;
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '0.85rem 1rem',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.88rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.62rem',
  fontWeight: 900,
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
};
