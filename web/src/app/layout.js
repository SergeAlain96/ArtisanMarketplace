/* eslint-disable react/prop-types */
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Artisan Marketplace',
  description: 'Web app for artisan discovery and product moderation'
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Navbar />
        <main className="container-page">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="container-page flex flex-col gap-1 py-5 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Artisan Marketplace</p>
            <p>Plateforme web artisanale - version locale</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
