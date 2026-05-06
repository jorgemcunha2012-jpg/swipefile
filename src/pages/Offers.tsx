import { useState } from 'react';
import { Search } from 'lucide-react';
import { Layout } from '../components/common/Layout';
import { OfferCard } from '../components/offers/OfferCard';
import { AdvancedFilters } from '../components/offers/AdvancedFilters';
import { useOffersStore } from '../store/offersStore';
import { useAuthStore } from '../store/authStore';

export function Offers() {
  const { offers, savedOffers, setFilters, filters, toggleSaved } = useOffersStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  const handleApplyFilters = () => {
    setFilters({ ...filters, search });
  };

  const filteredOffers = offers.filter((offer) => {
    if (search && !offer.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.language?.length && !filters.language.includes(offer.language)) return false;
    if (filters.platform?.length && !filters.platform.includes(offer.platform)) return false;
    if (filters.niche?.length && !filters.niche.includes(offer.niche)) return false;
    if (filters.structure?.length && !filters.structure.includes(offer.structure)) return false;
    if (filters.minAds && offer.num_ads < filters.minAds) return false;
    if (filters.maxAds && offer.num_ads > filters.maxAds) return false;
    return true;
  });

  const isSaved = (offerId: string) => savedOffers.some((s) => s.offer_id === offerId && s.user_id === user?.id);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Ofertas</h1>
          <p className="text-slate-400">{filteredOffers.length} ofertas encontradas</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome da oferta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyUp={handleApplyFilters}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition"
          />
        </div>

        <button
          onClick={() => {
            setFilters({ ...filters, escalating: !filters.escalating });
          }}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filters.escalating ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {filters.escalating ? '✓ Escalando' : 'Escalando'}
        </button>

        <AdvancedFilters filters={filters} onFiltersChange={setFilters} onApply={handleApplyFilters} />

        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isSaved={isSaved(offer.id)}
                onSave={() => {
                  if (user) toggleSaved(offer.id, user.id);
                }}
                onClick={() => {
                  window.location.href = `/offers/${offer.id}`;
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Nenhuma oferta encontrada</p>
            <p className="text-slate-500 text-sm mt-2">Tente ajustar seus filtros</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
