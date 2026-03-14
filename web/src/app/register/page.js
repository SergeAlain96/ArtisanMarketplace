'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '../../lib/api';
import { setSession } from '../../lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await registerUser({ name, email, password, role });
      setSession(data.token, data.user?.role);
      if (data.user?.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (data.user?.role === 'artisan') {
        router.push('/dashboard/artisan');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message || 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-5">
      <div className="space-y-1 text-center">
        <h1 className="section-title">Inscription</h1>
        <p className="section-subtitle">Crée ton compte en quelques secondes.</p>
      </div>
      <form className="card grid gap-3 shadow-lg shadow-brand-100/40 dark:shadow-none" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-control"
          placeholder="Nom"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
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

        <select
          className="input-control"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="user">Utilisateur</option>
          <option value="artisan">Artisan</option>
        </select>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>
    </section>
  );
}
