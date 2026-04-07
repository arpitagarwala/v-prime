'use client';
import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import CredentialVault from "@/components/CredentialVault";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';

  if (isAuthPage) {
    return (
      <div className={inter.className} style={{ backgroundColor: '#040405', minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  return (
    <div className={inter.className} style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-base)' }}>
        {children}
      </div>
      <CredentialVault />
    </div>
  );
}
