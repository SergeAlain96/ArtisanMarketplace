'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser } from '../../lib/api';
import { setSession } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser({ email, password });
      setSession(data.token, data.user?.role);
      const nextPath = searchParams.get('next');
      router.push(nextPath || '/');
    } catch (err) {
      setError(err.message || 'Connexion impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-5">
      <div className="space-y-1 text-center">
        <h1 className="section-title">Connexion</h1>
        <p className="section-subtitle">Accède à ton espace personnel sécurisé.</p>
      </div>
      <form className="card grid gap-3 shadow-lg shadow-brand-100/40 dark:shadow-none" onSubmit={handleSubmit}>
        <input
          type="email"
          className="input-control"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          className="input-control"
          placeholder="Mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </section>
  );
}
