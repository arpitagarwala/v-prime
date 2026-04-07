'use client';
import { useState } from 'react';
import { supabase, getDeviceId } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Monitor, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const deviceId = getDeviceId();
    const adminEmail = 'arpitagarwalms@gmail.com';

    try {
      // 1. Sign In
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // 2. Fetch User Profile for Device Check
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // 3. Admin Bypass or Device Match
      const isAdmin = email.toLowerCase() === adminEmail.toLowerCase();
      
      if (!isAdmin && profile && profile.authorized_device_id && profile.authorized_device_id !== deviceId) {
           await supabase.auth.signOut();
           throw new Error('UNAUTHORIZED DEVICE: ACCESS LOCKED');
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message.toUpperCase());
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
      fontFamily: 'Outfit, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Institutional Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(92,115,242,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(46,213,115,0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ 
          width: '100%', 
          maxWidth: '420px', 
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              background: 'rgba(92, 115, 242, 0.1)',
              borderRadius: '16px',
              marginBottom: '1.5rem',
              color: '#5c73f2',
              border: '1px solid rgba(92, 115, 242, 0.2)'
            }}
          >
             <Monitor size={24} />
          </motion.div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '0.75rem', color: '#fff' }}>
            V-PRIME <span style={{ color: '#5c73f2' }}>ACCESS</span>
          </h1>
          <div style={{ height: '1px', width: '40px', background: '#5c73f2', margin: '0.75rem auto', opacity: 0.6 }} />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              style={{ 
                background: 'rgba(239, 68, 68, 0.05)', 
                border: '1px solid rgba(239, 68, 68, 0.15)', 
                color: '#f87171', 
                padding: '0.75rem', 
                borderRadius: '12px', 
                fontSize: '0.65rem', 
                fontWeight: 800,
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                letterSpacing: '0.05em'
              }}
            >
               <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operator Identity</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@vprime.link" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                padding: '1rem', 
                borderRadius: '16px', 
                color: '#fff', 
                fontSize: '0.9rem', 
                outline: 'none',
                transition: 'all 0.2s ease'
              }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Encrypted Key</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)', 
                padding: '1rem', 
                borderRadius: '16px', 
                color: '#fff', 
                fontSize: '0.9rem', 
                outline: 'none',
                transition: 'all 0.2s ease'
              }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: '#5c73f2', 
              color: '#fff', 
              padding: '1rem', 
              borderRadius: '16px', 
              fontWeight: 900, 
              fontSize: '0.8rem', 
              cursor: 'pointer', 
              border: 'none', 
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              boxShadow: '0 8px 24px -6px rgba(92, 115, 242, 0.5)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><ShieldCheck size={18} /> Enter Terminal</>}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.05em' }}>
           SYSTEM CLASSIFIED // AUTHORIZED PERSONNEL ONLY
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        input:focus {
           background: rgba(255, 255, 255, 0.05) !important;
           border-color: rgba(92, 115, 242, 0.4) !important;
           box-shadow: 0 0 0 4px rgba(92, 115, 242, 0.1);
        }
      `}</style>
    </div>
  );
}
