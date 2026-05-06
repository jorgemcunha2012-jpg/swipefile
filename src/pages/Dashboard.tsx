import { TrendingUp, Zap, Sparkles } from 'lucide-react';
import { Layout } from '../components/common/Layout';
import { OfferCard } from '../components/offers/OfferCard';
import { useOffersStore } from '../store/offersStore';

export function Dashboard() {
  const { offers } = useOffersStore();

  const metrics = {
    radar: offers.filter((o) => o.momentum_tag === 'radar').length,
    hotThisWeek: offers.filter((o) => o.momentum_tag === 'hot').length,
    creativesInFocus: offers.filter((o) => o.momentum_tag === 'escalating').length,
  };

  const mostEscalating = offers
    .filter((o) => o.status === 'active')
    .sort((a, b) => b.num_ads - a.num_ads)
    .slice(0, 6);

  const topCreatives = offers
    .filter((o) => o.num_creatives > 0)
    .sort((a, b) => b.num_creatives - a.num_creatives)
    .slice(0, 3);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-400">Sinais mais quentes do momento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Radar Principal</p>
                <p className="text-3xl font-bold">{metrics.radar}</p>
              </div>
              <Sparkles className="text-primary" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Hot na Semana</p>
                <p className="text-3xl font-bold">{metrics.hotThisWeek}</p>
              </div>
              <Zap className="text-orange-500" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Criativos em Foco</p>
                <p className="text-3xl font-bold">{metrics.creativesInFocus}</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Mais Escaladas</h2>
          {mostEscalating.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mostEscalating.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onClick={() => (window.location.href = `/offers/${offer.id}`)} />
              ))}
            </div>
          ) : (
            <p className="text-slate-400">Nenhuma oferta encontrada</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Top Criativos</h2>
          {topCreatives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topCreatives.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onClick={() => (window.location.href = `/offers/${offer.id}`)} />
              ))}
            </div>
          ) : (
            <p className="text-slate-400">Nenhum criativo encontrado</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
