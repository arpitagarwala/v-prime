/**
 * V-Prime Supabase Setup Script
 * Run: node scripts/setup-supabase.mjs
 * This will create the profiles table and set up admin access.
 */

const SUPABASE_URL = 'https://pzaxvnjezlwhmeizjyfh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXh2bmplemx3aG1laXpqeWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NzgyMjgsImV4cCI6MjA5MTE1NDIyOH0.nQawZTFcI66PoDieq8QTgdxqcjQZmicWMjMXwe3Lnes';

const sql = `
-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  authorized_device_id text,
  is_admin boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Drop existing policies if any (safe re-run)
drop policy if exists "Allow read own profile" on public.profiles;
drop policy if exists "Allow update own profile" on public.profiles;
drop policy if exists "Allow insert profile" on public.profiles;

-- 4. Create policies
create policy "Allow read own profile" on public.profiles 
  for select using (auth.uid() = id);

create policy "Allow update own profile" on public.profiles 
  for update using (auth.uid() = id);

create policy "Allow insert profile" on public.profiles 
  for insert with check (true);
`;

// Use the Supabase Management API via the project's SQL endpoint
const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  },
  body: JSON.stringify({ query: sql }),
});

if (!response.ok) {
  const err = await response.text();
  // exec_sql doesn't exist on anon — user needs service role key or SQL editor
  console.log('\n❌ Cannot run DDL with anon key (expected).');
  console.log('\n📋 MANUAL STEP REQUIRED:');
  console.log('Please paste this SQL into: https://supabase.com/dashboard/project/pzaxvnjezlwhmeizjyfh/sql/new\n');
  console.log('=' .repeat(60));
  console.log(sql);
  console.log('=' .repeat(60));
} else {
  console.log('✅ Supabase database setup complete!');
}
