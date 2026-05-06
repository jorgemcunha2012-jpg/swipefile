import { useEffect, useState } from 'react';
import { getOffers } from './lib/supabase';

// SVG Icons
const Icons = {
  heart: (filled: boolean) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  list: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  trending: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.46 15.89 8.41 10.88 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  checkCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  star: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.09 24.96 12 18.54 3.91 24.96 6.82 16.70 0 10.27 8.91 10.26 12 2" />
    </svg>
  ),
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [offers, setOffers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [sortBy, setSortBy] = useState('date');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterMomentum, setFilterMomentum] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('darkoffers_favorites');
    if (saved) setFavorites(JSON.parse(saved));
    loadOffers();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkoffers_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const loadOffers = async () => {
    const { data } = await getOffers();
    setOffers(data || []);
    setLoading(false);
  };

  const toggleFavorite = (offerId: string) => {
    setFavorites((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId]
    );
  };

  const isFavorite = (offerId: string) => favorites.includes(offerId);

  const filteredOffers = offers
    .filter(
      (o) =>
        (o.name.toLowerCase().includes(search.toLowerCase()) ||
          o.niche.toLowerCase().includes(search.toLowerCase()) ||
          o.platform.toLowerCase().includes(search.toLowerCase())) &&
        (filterPlatform === 'all' || o.platform === filterPlatform) &&
        (filterMomentum === 'all' || o.momentum_tag === filterMomentum)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'ads':
          return b.num_ads - a.num_ads;
        case 'creatives':
          return b.num_creatives - a.num_creatives;
        case 'days':
          return b.days_active - a.days_active;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '2px solid #e2e8f0', borderTop: '2px solid #6366f1', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading offers...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' }}>
              DARK OFFERs
            </h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', marginTop: '2px', margin: 0 }}>Competitive Intelligence</p>
          </div>

          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard, count: offers.length },
              { id: 'offers', label: 'All Offers', icon: Icons.list, count: filteredOffers.length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                style={{
                  background: page === item.id ? '#f1f5f9' : 'transparent',
                  border: 'none',
                  color: page === item.id ? '#1e293b' : '#64748b',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: page === item.id ? '600' : '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseOver={(e) => {
                  if (page !== item.id) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
                  }
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = page === item.id ? '#f1f5f9' : 'transparent';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon()}</span>
                {item.label} {item.count > 0 && <span style={{ fontSize: '11px', opacity: 0.6 }}>({item.count})</span>}
              </button>
            ))}
          </nav>

          <div style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', color: '#ef4444' }}>{Icons.heart(true)}</span>
            {favorites.length}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 32px' }}>
        {page === 'dashboard' && <Dashboard offers={offers} favorites={favorites} onSelectOffer={setSelectedOffer} />}
        {page === 'offers' && (
          <AllOffers
            offers={filteredOffers}
            search={search}
            onSearch={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterPlatform={filterPlatform}
            onFilterPlatform={setFilterPlatform}
            filterMomentum={filterMomentum}
            onFilterMomentum={setFilterMomentum}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectOffer={setSelectedOffer}
            allOffers={offers}
          />
        )}
      </main>

      {/* Detail Modal */}
      {selectedOffer && (
        <DetailModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} isFavorite={isFavorite(selectedOffer.id)} onToggleFavorite={toggleFavorite} />
      )}
    </div>
  );
}

function Dashboard({ offers, favorites, onSelectOffer }: any) {
  const stats = [
    { label: 'Total Offers', value: offers.length, sublabel: 'Active campaigns' },
    { label: 'Escalating', value: offers.filter((o: any) => o.momentum_tag === 'escalating').length, sublabel: 'High momentum' },
    { label: 'Hot Offers', value: offers.filter((o: any) => o.momentum_tag === 'hot').length, sublabel: 'Trending now' },
    { label: 'Saved', value: favorites.length, sublabel: 'In your collection' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Dashboard</h2>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Monitor your competitive intelligence across all platforms</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '48px' }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#cbd5e1';
              (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
              (e.currentTarget as HTMLDivElement).style.background = '#ffffff';
            }}
          >
            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px' }}>{stat.value}</p>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>{stat.sublabel}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px' }}>Recent Offers</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {offers.slice(0, 6).map((offer: any) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            isFavorite={favorites.includes(offer.id)}
            onToggleFavorite={() => {}}
            onSelect={() => onSelectOffer(offer)}
          />
        ))}
      </div>
    </div>
  );
}

function AllOffers({
  offers,
  search,
  onSearch,
  sortBy,
  onSortChange,
  filterPlatform,
  onFilterPlatform,
  filterMomentum,
  onFilterMomentum,
  favorites,
  onToggleFavorite,
  onSelectOffer,
  allOffers,
}: any) {
  const platforms: string[] = ['all', ...Array.from(new Set(allOffers.map((o: any) => o.platform))) as string[]];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Intelligence Library</h2>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          {offers.length} offer{offers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div style={{ marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search offers..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1e293b',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = '#cbd5e1';
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = '#e2e8f0';
              }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
              {Icons.search()}
            </span>
          </div>
        </div>

        <div style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>Platform</label>
          <select
            value={filterPlatform}
            onChange={(e) => onFilterPlatform(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#1e293b',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {platforms.map((p: string) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Platforms' : p.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>Momentum</label>
          <select
            value={filterMomentum}
            onChange={(e) => onFilterMomentum(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#1e293b',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Momentum</option>
            <option value="escalating">Escalating</option>
            <option value="hot">Hot</option>
          </select>
        </div>

        <div style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#1e293b',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <option value="date">Newest</option>
            <option value="ads">Most Ads</option>
            <option value="creatives">Most Creatives</option>
            <option value="days">Most Active</option>
          </select>
        </div>
      </div>

      {offers.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '60px 40px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500', margin: 0 }}>No offers found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {offers.map((offer: any) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              isFavorite={favorites.includes(offer.id)}
              onToggleFavorite={() => onToggleFavorite(offer.id)}
              onSelect={() => onSelectOffer(offer)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, isFavorite, onToggleFavorite, onSelect }: any) {
  const getStatusColor = (status: string) => {
    return status === 'active' ? '#10b981' : '#6b7280';
  };

  return (
    <div
      onClick={onSelect}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#cbd5e1';
        (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
        (e.currentTarget as HTMLDivElement).style.background = '#ffffff';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <h4 style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px', flex: 1, margin: 0, lineHeight: 1.4 }}>
          {offer.name}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '8px',
            padding: '4px',
            transition: 'transform 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            color: isFavorite ? '#ef4444' : '#cbd5e1',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          {Icons.heart(isFavorite)}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '11px',
            padding: '4px 8px',
            background: '#f1f5f9',
            borderRadius: '4px',
            color: getStatusColor(offer.status),
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {offer.status === 'active' ? Icons.checkCircle() : ''}
          {offer.status === 'active' ? 'Active' : 'Inactive'}
        </span>
        {offer.momentum_tag && (
          <span
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              background: '#f1f5f9',
              borderRadius: '4px',
              color: '#1e293b',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {offer.momentum_tag === 'escalating' ? Icons.trending() : Icons.zap()}
            {offer.momentum_tag === 'escalating' ? 'Escalating' : 'Hot'}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', margin: '0 0 4px' }}>ADS</p>
          <p style={{ fontWeight: '800', fontSize: '18px', color: '#6366f1', margin: 0 }}>{offer.num_ads}</p>
        </div>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', margin: '0 0 4px' }}>CREATIVES</p>
          <p style={{ fontWeight: '800', fontSize: '18px', color: '#8b5cf6', margin: 0 }}>{offer.num_creatives}</p>
        </div>
      </div>

      <div style={{ paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '500', margin: 0 }}>
          {offer.platform.toUpperCase()} • {offer.niche}
        </p>
        <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>{offer.days_active}d</p>
      </div>
    </div>
  );
}

function DetailModal({ offer, onClose, isFavorite, onToggleFavorite }: any) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#ffffff',
          borderRadius: '16px 16px 0 0',
          padding: '32px',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 101,
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>{offer.name}</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              {offer.platform.toUpperCase()} • {offer.niche}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => onToggleFavorite(offer.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: isFavorite ? '#ef4444' : '#cbd5e1',
              }}
            >
              {Icons.heart(isFavorite)}
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#64748b',
              }}
            >
              {Icons.close()}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Status', value: offer.status === 'active' ? 'Active' : 'Inactive' },
            { label: 'Momentum', value: offer.momentum_tag ? (offer.momentum_tag === 'escalating' ? 'Escalating' : 'Hot') : '—' },
            { label: 'Ads Count', value: offer.num_ads },
            { label: 'Creatives', value: offer.num_creatives },
            { label: 'Days Active', value: `${offer.days_active}d` },
            { label: 'Language', value: offer.language || '—' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {offer.structure && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>Structure</h3>
            <p style={{ color: '#64748b', fontSize: '14px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', margin: 0 }}>
              {offer.structure}
            </p>
          </div>
        )}

        {offer.product_type && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>Product Type</h3>
            <p style={{ color: '#64748b', fontSize: '14px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', margin: 0 }}>
              {offer.product_type}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
