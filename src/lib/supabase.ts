import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Institutional Device Fingerprinting
 * Generates a unique UUID for the current machine/browser to enforce the single-seat policy.
 */
export const getDeviceId = () => {
  if (typeof window === 'undefined') return 'server';
  
  let deviceId = localStorage.getItem('v_prime_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('v_prime_device_id', deviceId);
  }
  return deviceId;
};

/**
 * Admin Whitelist Check
 * Determines if the current analyst has unrestricted multi-device privileges.
 */
export const isAdmin = (email: string) => {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'arpitagarwalms@gmail.com';
  return email.toLowerCase() === adminEmail.toLowerCase();
};
