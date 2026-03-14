/* eslint-disable react/prop-types */
export default function ProductCard({ product }) {
  return (
    <article className="card h-full transition hover:-translate-y-1 hover:shadow-md dark:hover:shadow-none">
      <div className="mb-3 h-36 rounded-xl bg-gradient-to-br from-brand-100 via-brand-50 to-cyan-50 dark:from-slate-800 dark:via-slate-900 dark:to-brand-900/20" />
      <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{product.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{product.description}</p>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <span className="text-sm text-slate-500 dark:text-slate-400">Artisan: {product.artisanId?.name || 'N/A'}</span>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-700/30 dark:text-brand-100">
          {Number(product.price).toFixed(2)} €
        </span>
      </div>
    </article>
  );
}
