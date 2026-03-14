import ProductCard from '../../components/ProductCard';
import { fetchProducts } from '../../lib/api';

export default async function CatalogPage() {
  let result = { items: [] };

  try {
    result = await fetchProducts(1, 24);
  } catch {
    result = { items: [] };
  }

  return (
    <section className="space-y-6">
      <div className="card flex flex-col gap-2 border-0 bg-white/80 dark:bg-slate-900/70 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="section-title">Catalogue produits</h1>
          <p className="section-subtitle">Parcours les créations artisanales disponibles.</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-700/30 dark:text-brand-100">
          {result.items.length} produit(s)
        </span>
      </div>

      {result.items.length === 0 ? (
        <div className="card text-sm text-slate-600 dark:text-slate-300">Aucun produit disponible pour le moment.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
