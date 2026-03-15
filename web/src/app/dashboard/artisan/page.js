'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthGate from '../../../components/AuthGate';
import ProductForm from '../../../components/ProductForm';
import { createProduct, deleteProduct, fetchMyProducts, updateProduct } from '../../../lib/api';

export default function ArtisanDashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingProductId, setEditingProductId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const editingProduct = useMemo(
    () => products.find((product) => String(product._id) === String(editingProductId)) || null,
    [editingProductId, products]
  );

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError('');

    try {
      const result = await fetchMyProducts();
      setProducts(result.items || []);
    } catch (err) {
      setError(err.message || 'Unable to load your products.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleCreateProduct(payload) {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setMessage('Product updated successfully.');
        setEditingProductId('');
      } else {
        await createProduct(payload);
        setMessage('Product created successfully.');
      }

      await loadProducts();
    } catch (err) {
      setError(err.message || 'Operation failed. Check your artisan role and token.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(productId) {
    const confirmed = globalThis.confirm('Confirm deletion of this product?');
    if (!confirmed) return;

    setDeletingId(String(productId));
    setError('');
    setMessage('');

    try {
      await deleteProduct(productId);
      setMessage('Product deleted successfully.');
      if (String(editingProductId) === String(productId)) {
        setEditingProductId('');
      }
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Deletion failed.');
    } finally {
      setDeletingId('');
    }
  }

  return (
    <AuthGate roles={['artisan']}>
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Artisan Dashboard</h1>
        <p className="text-slate-600">Add, view, edit, and delete your products from this space.</p>
        <ProductForm
          onSubmit={handleCreateProduct}
          loading={loading}
          initialValues={editingProduct}
          submitLabel={editingProduct ? 'Update product' : 'Create product'}
          title={editingProduct ? 'Edit product' : 'Add product'}
          onCancel={editingProduct ? () => setEditingProductId('') : undefined}
        />
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="card space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">My products</h2>
            <button
              type="button"
              onClick={loadProducts}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-100"
            >
              Refresh
            </button>
          </div>

          {loadingProducts ? <p className="text-sm text-slate-600">Loading products...</p> : null}

          {!loadingProducts && products.length === 0 ? (
            <p className="text-sm text-slate-600">No products created yet.</p>
          ) : null}

          {loadingProducts ? null : (
            <div className="grid gap-3">
              {products.map((product) => {
                const isEditing = String(editingProductId) === String(product._id);
                const isDeleting = String(deletingId) === String(product._id);

                return (
                  <article key={product._id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold">{product.name}</h3>
                        <p className="text-sm text-slate-600">{product.description}</p>
                        <p className="text-sm font-medium text-brand-700">{product.price} €</p>
                        <p className="text-xs text-slate-500">ID: {product._id}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(String(product._id));
                            setMessage('');
                            setError('');
                          }}
                          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-100"
                        >
                          {isEditing ? 'Editing' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteProduct(product._id)}
                          className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AuthGate>
  );
}
