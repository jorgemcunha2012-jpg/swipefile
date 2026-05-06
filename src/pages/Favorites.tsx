import { Layout } from '../components/common/Layout';
import { OfferCard } from '../components/offers/OfferCard';
import { useOffersStore } from '../store/offersStore';
import { useAuthStore } from '../store/authStore';

export function Favorites() {
  const { offers, savedOffers, toggleSaved } = useOffersStore();
  const { user } = useAuthStore();

  const favoriteOffers = offers.filter((offer) =>
    savedOffers.some((s) => s.offer_id === offer.id && s.user_id === user?.id)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Meus Favoritos</h1>
          <p className="text-slate-400">{favoriteOffers.length} ofertas salvas</p>
        </div>

        {favoriteOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isSaved={true}
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
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-lg mb-2">Nenhuma oferta salva ainda</p>
            <p className="text-slate-500 text-sm mb-4">Explore as ofertas e clique no ❤️ para salvar suas favoritas</p>
            <a href="/offers" className="inline-block bg-primary hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded transition">
              Explorar Ofertas
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}
