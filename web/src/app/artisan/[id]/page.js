/* eslint-disable react/prop-types */
import ProductCard from '../../../components/ProductCard';
import RatingStars from '../../../components/RatingStars';
import { fetchArtisanDetails, fetchRatingsForArtisan } from '../../../lib/api';

export default async function ArtisanDetailPage({ params }) {
  const { id } = params;

  let details = null;
  let ratings = { items: [], average: 0, count: 0 };

  try {
    details = await fetchArtisanDetails(id);
    ratings = await fetchRatingsForArtisan(id);
  } catch {
    details = null;
  }

  if (!details) {
    return <div className="card">Artisan not found.</div>;
  }

  return (
    <section className="space-y-6">
      <div className="card border-0 bg-gradient-to-br from-white to-brand-50/50 dark:from-slate-900 dark:to-slate-800">
        <h1 className="section-title">{details.artisan?.name}</h1>
        <p className="mt-3 max-w-3xl text-slate-700 dark:text-slate-300">{details.profile?.bio || 'No biography.'}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{details.profile?.location || 'Location not specified'}</p>
        <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900 dark:shadow-none">
          <RatingStars value={ratings.average} />
          <span className="text-sm text-slate-600 dark:text-slate-300">{ratings.average} / 5 ({ratings.count} review(s))</span>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Products</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(details.products || []).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
