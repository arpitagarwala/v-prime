import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client using @supabase/ssr — stores session in COOKIES (not localStorage)
 * so the Next.js middleware can read it server-side and allow/block routes correctly.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
