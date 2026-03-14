/* eslint-disable react/prop-types */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getToken } from '../lib/auth';

export default function Navbar() {
  const pathname = usePathname();
  const hasToken = globalThis.window !== undefined && Boolean(getToken());
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (globalThis.window === undefined) return;

    const storedTheme = globalThis.localStorage.getItem('artisan_marketplace_theme');
    const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme = storedTheme || (prefersDark ? 'dark' : 'light');

    setTheme(nextTheme);
    globalThis.document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  }, []);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    globalThis.document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    globalThis.localStorage.setItem('artisan_marketplace_theme', nextTheme);
  }

  const navItemClass = (href) => {
    const isActive = pathname === href || pathname?.startsWith(`${href}/`);
    return [
      'rounded-lg px-3 py-1.5 transition',
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-700/25 dark:text-brand-100'
        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
    ].join(' ');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="container-page flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold text-white shadow-glow">
            A
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 sm:text-lg">Artisan Marketplace</span>
        </Link>

        <div className="flex items-center gap-2 text-sm">
          <button type="button" className="btn-secondary px-3" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link href="/catalog" className={navItemClass('/catalog')}>
            Catalogue
          </Link>
          <Link href="/dashboard/artisan" className={navItemClass('/dashboard/artisan')}>
            Artisan
          </Link>
          <Link href="/dashboard/admin" className={navItemClass('/dashboard/admin')}>
            Admin
          </Link>

          {hasToken ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                clearSession();
                globalThis.location.reload();
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
