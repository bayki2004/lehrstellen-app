'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      const user = useAuthStore.getState().user;
      if (user?.role !== 'COMPANY') {
        useAuthStore.getState().logout();
        return;
      }
      router.push('/');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F5F6FA] px-4">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] h-[700px] w-[700px] rounded-full bg-primary/[0.03]" />
        <div className="absolute -bottom-[30%] -left-[15%] h-[500px] w-[500px] rounded-full bg-primary/[0.02]" />
      </div>

      <div className="relative w-full max-w-[400px]">
        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-elevated">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-sm tracking-tight">
              LM
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text">LehrMatch</h1>
            <p className="mt-1 text-[13px] text-text-tertiary">
              Firmen-Dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="firma@beispiel.ch"
                required
                className="w-full rounded-xl border border-border-light bg-background/50 px-4 py-2.5 text-[14px] text-text outline-none placeholder:text-text-tertiary focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ihr Passwort"
                required
                className="w-full rounded-xl border border-border-light bg-background/50 px-4 py-2.5 text-[14px] text-text outline-none placeholder:text-text-tertiary focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-error-light px-4 py-2.5 text-[13px] font-medium text-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark py-3 text-[14px] font-semibold text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[12px] text-text-tertiary">
          Nur für Unternehmen. Schüler nutzen bitte die mobile App.
        </p>
      </div>
    </div>
  );
}
