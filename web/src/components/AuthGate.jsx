/* eslint-disable react/prop-types */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { clearSession, getToken } from '../lib/auth';
import { fetchMe } from '../lib/api';

export default function AuthGate({ children, roles = [] }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState('');

  const acceptedRoles = useMemo(() => roles, [roles]);

  useEffect(() => {
    let active = true;

    async function verify() {
      const token = getToken();
      if (!token) {
        if (active) {
          setAuthorized(false);
          setMessage('Tu dois te connecter pour accéder à cette page.');
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchMe();
        const role = data?.user?.role || '';
        const roleAllowed = acceptedRoles.length === 0 || acceptedRoles.includes(role);

        if (active) {
          setAuthorized(roleAllowed);
          setMessage(roleAllowed ? '' : 'Accès refusé pour ton rôle.');
        }
      } catch {
        clearSession();
        if (active) {
          setAuthorized(false);
          setMessage('Session expirée. Connecte-toi à nouveau.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [acceptedRoles]);

  if (loading) {
    return <div className="card">Vérification de session...</div>;
  }

  if (!authorized) {
    return (
      <div className="card space-y-2">
        <p className="text-sm text-red-600">{message || 'Accès non autorisé.'}</p>
        <Link href="/login" className="inline-flex rounded-md border px-3 py-1.5 text-sm hover:bg-slate-100">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return children;
}
