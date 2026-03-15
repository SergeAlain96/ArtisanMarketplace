'use client';

import { useCallback, useEffect, useState } from 'react';
import AuthGate from '../../../components/AuthGate';
import { deleteAdminArtisan, deleteAdminProduct, fetchAdminArtisans } from '../../../lib/api';

export default function AdminDashboardPage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState({ items: [], page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [productIdToDelete, setProductIdToDelete] = useState('');

  const loadArtisans = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAdminArtisans(1, 10, search);
      setData(result);
    } catch (err) {
      setError(err.message || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!active) return;
      await loadArtisans();
    }

    load();

    return () => {
      active = false;
    };
  }, [loadArtisans]);

  async function handleDeleteArtisan(artisanId) {
    const confirmed = globalThis.confirm('Confirm deletion of this artisan?');
    if (!confirmed) return;

    setDeletingId(artisanId);
    setActionMessage('');

    try {
      const result = await deleteAdminArtisan(artisanId);
      setActionMessage(
        `Artisan deleted. Products: ${result.moderationSummary?.productsDeleted || 0}, ` +
          `Reviews received: ${result.moderationSummary?.ratingsReceivedDeleted || 0}.`
      );
      await loadArtisans();
    } catch (err) {
      setError(err.message || 'Unable to delete artisan.');
    } finally {
      setDeletingId('');
    }
  }

  async function handleDeleteProductById() {
    const trimmedId = productIdToDelete.trim();
    if (!trimmedId) return;

    setActionMessage('');
    setError('');

    try {
      const result = await deleteAdminProduct(trimmedId);
      setActionMessage(`Product deleted: ${result.moderationSummary?.productName || trimmedId}`);
      setProductIdToDelete('');
    } catch (err) {
      setError(err.message || 'Unable to delete product.');
    }
  }

  return (
    <AuthGate roles={['admin']}>
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <input
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Search artisan (name/email)"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="card flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="flex-1 rounded-md border border-slate-300 px-3 py-2"
            placeholder="Delete a product by ID"
            value={productIdToDelete}
            onChange={(event) => setProductIdToDelete(event.target.value)}
          />
          <button
            type="button"
            onClick={handleDeleteProductById}
            className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700"
          >
            Delete product
          </button>
        </div>

        {loading ? <div className="card">Loading...</div> : null}
        {error ? <div className="card text-red-600">{error}</div> : null}
        {actionMessage ? <div className="card text-emerald-700">{actionMessage}</div> : null}

        {!loading && !error ? (
          <div className="card overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Artisan</th>
                  <th className="py-2">Profile</th>
                  <th className="py-2">Products</th>
                  <th className="py-2">Ratings</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((artisan) => (
                  <tr key={artisan._id} className="border-b">
                    <td className="py-2">
                      <p className="font-medium">{artisan.name}</p>
                      <p className="text-slate-500">{artisan.email}</p>
                    </td>
                    <td className="py-2">{artisan.moderation?.hasProfile ? 'Yes' : 'No'}</td>
                    <td className="py-2">{artisan.moderation?.productsCount || 0}</td>
                    <td className="py-2">{artisan.moderation?.ratingsCount || 0}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        disabled={deletingId === artisan._id}
                        onClick={() => handleDeleteArtisan(artisan._id)}
                        className="rounded-md border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === artisan._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-3 text-xs text-slate-500">
              Page {data.page} / {data.totalPages} - Total artisans: {data.total}
            </p>
          </div>
        ) : null}
      </section>
    </AuthGate>
  );
}
