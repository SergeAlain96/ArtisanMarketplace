/* eslint-disable react/prop-types */
import Link from 'next/link';

export default function ArtisanCard({ artisan }) {
  return (
    <article className="card group transition hover:-translate-y-1 hover:shadow-md dark:hover:shadow-none">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-700/30 dark:text-brand-100">
          Artisan
        </span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {artisan?.userId?.name || artisan?.name}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{artisan?.location || 'Location not specified'}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {artisan?.bio || 'No biography provided.'}
      </p>

      <Link
        href={`/artisan/${artisan?.userId?._id || artisan?._id}`}
        className="btn-primary mt-5"
      >
        View profile
      </Link>
    </article>
  );
}
