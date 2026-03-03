import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'LehrMatch — Firmen-Dashboard',
  description: 'Verwalten Sie Ihre Lehrstellen, Bewerbungen und Matches.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              style: {
                fontFamily: 'Outfit, system-ui, sans-serif',
                borderRadius: '12px',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
