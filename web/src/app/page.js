import ArtisanCard from '../components/ArtisanCard';
import { fetchArtisans } from '../lib/api';

export default async function HomePage() {
  let artisans = [];

  try {
    artisans = await fetchArtisans();
  } catch {
    artisans = [];
  }

  return (
    <section className="space-y-8">
      <div className="card overflow-hidden border-0 bg-gradient-to-r from-brand-700 via-brand-500 to-cyan-500 text-white shadow-lg dark:from-slate-900 dark:via-brand-700 dark:to-slate-800">
        <div className="grid gap-6 p-1 sm:grid-cols-5">
          <div className="space-y-4 p-5 sm:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Marketplace</p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Handcrafted creations presented with elegance.</h1>
            <p className="max-w-xl text-sm text-white/90 sm:text-base">
              Discover local makers, explore their products, and connect with a modern creative world.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="/catalog" className="btn-secondary border-white/60 bg-white text-brand-700 hover:bg-white/90">
                View catalog
              </a>
              <a href="/register" className="btn-secondary border-white/60 bg-transparent text-white hover:bg-white/10">
                Join the platform
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-white/15 p-5 backdrop-blur sm:col-span-2 dark:bg-slate-900/40">
            <p className="text-sm text-white/80">Listed makers</p>
            <p className="mt-1 text-4xl font-bold">{artisans.length}</p>
            <p className="mt-3 text-sm text-white/80">Highlighted qualified profiles and authentic products.</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title">Featured makers</h2>
        <p className="section-subtitle">A selection of talented creators on the marketplace.</p>
      </div>

      {artisans.length === 0 ? (
        <div className="card text-sm text-slate-600 dark:text-slate-300">No makers found at the moment.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artisans.map((artisan) => (
            <ArtisanCard key={artisan._id || artisan.userId?._id} artisan={artisan} />
          ))}
        </div>
      )}
    </section>
  );
}
