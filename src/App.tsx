import { useEffect, useState } from 'react';
import { getOffers } from './lib/supabase';

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
  download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  barChart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  tag: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  eye: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

interface OfferNote {
  offerId: string;
  content: string;
  createdAt: number;
}

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
  const [filterNiche, setFilterNiche] = useState('all');
  const [filterProductType, setFilterProductType] = useState('all');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('darkoffers_favorites');
    if (saved) setFavorites(JSON.parse(saved));
    const savedNotes = localStorage.getItem('darkoffers_notes');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    loadOffers();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkoffers_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('darkoffers_notes', JSON.stringify(notes));
  }, [notes]);

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

  const updateNote = (offerId: string, content: string) => {
    setNotes((prev) => ({
      ...prev,
      [offerId]: content,
    }));
  };

  const toggleCompareSelection = (offerId: string) => {
    setSelectedForComparison((prev) =>
      prev.includes(offerId) ? prev.filter((id) => id !== offerId) : [...prev, offerId].slice(-3)
    );
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Platform', 'Niche', 'Ads', 'Creatives', 'Days Active', 'Status', 'Momentum', 'Language', 'Product Type'];
    const rows = filteredOffers.map((o) => [
      o.name,
      o.platform,
      o.niche,
      o.num_ads,
      o.num_creatives,
      o.days_active,
      o.status,
      o.momentum_tag || '—',
      o.language || '—',
      o.product_type || '—',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dark-offers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredOffers = offers
    .filter(
      (o) =>
        (o.name.toLowerCase().includes(search.toLowerCase()) ||
          o.niche.toLowerCase().includes(search.toLowerCase()) ||
          o.platform.toLowerCase().includes(search.toLowerCase())) &&
        (filterPlatform === 'all' || o.platform === filterPlatform) &&
        (filterMomentum === 'all' || o.momentum_tag === filterMomentum) &&
        (filterNiche === 'all' || o.niche === filterNiche) &&
        (filterProductType === 'all' || o.product_type === filterProductType)
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

  const uniqueNiches = Array.from(new Set(offers.map((o: any) => o.niche))) as string[];
  const uniqueProductTypes = Array.from(new Set(offers.map((o: any) => o.product_type).filter(Boolean))) as string[];

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

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
            { id: 'offers', label: 'Intelligence Library', icon: Icons.list },
            { id: 'analysis', label: 'Analysis', icon: Icons.barChart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setPage(tab.id);
                setCompareMode(false);
                setSelectedForComparison([]);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 16px',
                borderBottom: page === tab.id ? '2px solid #6366f1' : 'none',
                color: page === tab.id ? '#6366f1' : '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: page === tab.id ? '600' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                marginBottom: '-1px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{tab.icon()}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {page === 'dashboard' && (
          <Dashboard offers={offers} favorites={favorites} onSelectOffer={setSelectedOffer} />
        )}

        {page === 'offers' &&
          (compareMode ? (
            <ComparisonView
              offers={offers.filter((o) => selectedForComparison.includes(o.id))}
              onBack={() => {
                setCompareMode(false);
                setSelectedForComparison([]);
              }}
              notes={notes}
              isFavorite={isFavorite}
            />
          ) : (
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
              filterNiche={filterNiche}
              onFilterNiche={setFilterNiche}
              filterProductType={filterProductType}
              onFilterProductType={setFilterProductType}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelectOffer={setSelectedOffer}
              allOffers={offers}
              uniqueNiches={uniqueNiches}
              uniqueProductTypes={uniqueProductTypes}
              compareMode={compareMode}
              selectedForComparison={selectedForComparison}
              onToggleCompare={toggleCompareSelection}
              onExport={exportToCSV}
              onStartComparison={() => setCompareMode(true)}
            />
          ))}

        {page === 'analysis' && <Analysis offers={offers} filteredOffers={filteredOffers} />}
      </main>

      {selectedOffer && (
        <DetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          isFavorite={isFavorite(selectedOffer.id)}
          onToggleFavorite={toggleFavorite}
          note={notes[selectedOffer.id] || ''}
          onNoteChange={(content) => updateNote(selectedOffer.id, content)}
        />
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
  filterNiche,
  onFilterNiche,
  filterProductType,
  onFilterProductType,
  favorites,
  onToggleFavorite,
  onSelectOffer,
  allOffers,
  uniqueNiches,
  uniqueProductTypes,
  compareMode,
  selectedForComparison,
  onToggleCompare,
  onExport,
  onStartComparison,
}: any) {
  const platforms: string[] = ['all', ...Array.from(new Set(allOffers.map((o: any) => o.platform))) as string[]];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Intelligence Library</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {offers.length} offer{offers.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {selectedForComparison.length > 1 && (
            <button
              onClick={onStartComparison}
              style={{
                background: '#6366f1',
                color: '#ffffff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Compare ({selectedForComparison.length})
            </button>
          )}
          <button
            onClick={onExport}
            style={{
              background: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {Icons.download()} Export CSV
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Search</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                color: '#1e293b',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
              {Icons.search()}
            </span>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Platform</label>
          <select
            value={filterPlatform}
            onChange={(e) => onFilterPlatform(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#1e293b',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {platforms.map((p: string) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All' : p.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Niche</label>
          <select
            value={filterNiche}
            onChange={(e) => onFilterNiche(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#1e293b',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Niches</option>
            {uniqueNiches.map((n: string) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Product Type</label>
          <select
            value={filterProductType}
            onChange={(e) => onFilterProductType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#1e293b',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Types</option>
            {uniqueProductTypes.map((t: string) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Momentum</label>
          <select
            value={filterMomentum}
            onChange={(e) => onFilterMomentum(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#1e293b',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Momentum</option>
            <option value="escalating">Escalating</option>
            <option value="hot">Hot</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#1e293b',
              fontSize: '13px',
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
              compareMode={compareMode}
              isSelected={selectedForComparison.includes(offer.id)}
              onToggleCompare={() => onToggleCompare(offer.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, isFavorite, onToggleFavorite, onSelect, compareMode, isSelected, onToggleCompare }: any) {
  const getStatusColor = (status: string) => {
    return status === 'active' ? '#10b981' : '#6b7280';
  };

  return (
    <div
      onClick={() => {
        if (compareMode) {
          onToggleCompare();
        } else {
          onSelect();
        }
      }}
      style={{
        background: isSelected ? '#eef2ff' : '#ffffff',
        border: isSelected ? '2px solid #6366f1' : '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseOver={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#cbd5e1';
          (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
        }
      }}
      onMouseOut={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
          (e.currentTarget as HTMLDivElement).style.background = '#ffffff';
        }
      }}
    >
      {compareMode && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            width: '20px',
            height: '20px',
            background: isSelected ? '#6366f1' : '#e2e8f0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: '700',
          }}
        >
          {isSelected ? '✓' : ''}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <h4 style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px', flex: 1, margin: 0, lineHeight: 1.4, paddingLeft: compareMode ? '28px' : '0' }}>
          {offer.name}
        </h4>
        {!compareMode && (
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
        )}
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

function DetailModal({ offer, onClose, isFavorite, onToggleFavorite, note, onNoteChange }: any) {
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
            { label: 'Clicks', value: offer.num_clicks || '—' },
            { label: 'Days Active', value: `${offer.days_active}d` },
            { label: 'Language', value: offer.language || '—' },
            { label: 'Product Type', value: offer.product_type || '—' },
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

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>Your Notes</h3>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Add your observations, insights, or strategies for this offer..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#1e293b',
              fontSize: '14px',
              fontFamily: 'inherit',
              minHeight: '120px',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </>
  );
}

function Analysis({ offers, filteredOffers }: any) {
  const platforms = Array.from(new Set(offers.map((o: any) => o.platform))) as string[];
  const momentumCounts = {
    hot: offers.filter((o: any) => o.momentum_tag === 'hot').length,
    escalating: offers.filter((o: any) => o.momentum_tag === 'escalating').length,
  };

  const platformStats = platforms.map((platform) => ({
    platform,
    count: offers.filter((o: any) => o.platform === platform).length,
    avgAds: Math.round(
      offers.filter((o: any) => o.platform === platform).reduce((sum: number, o: any) => sum + (o.num_ads || 0), 0) /
        offers.filter((o: any) => o.platform === platform).length
    ),
  }));

  const nicheCounts = Object.entries(
    offers.reduce(
      (acc: Record<string, number>, o: any) => {
        acc[o.niche] = (acc[o.niche] || 0) + 1;
        return acc;
      },
      {}
    )
  )
    .map(([niche, count]) => ({ niche, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Market Analysis</h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Deep insights into competitive intelligence</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Offers', value: offers.length, color: '#6366f1' },
          { label: 'Escalating', value: momentumCounts.escalating, color: '#f59e0b' },
          { label: 'Hot Offers', value: momentumCounts.hot, color: '#ef4444' },
          { label: 'Avg Ads/Offer', value: Math.round(offers.reduce((sum: number, o: any) => sum + (o.num_ads || 0), 0) / offers.length), color: '#8b5cf6' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
            <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', margin: '0 0 12px', textTransform: 'uppercase' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '32px', fontWeight: '800', color: stat.color, margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px' }}>By Platform</h3>
          {platformStats.map((stat) => (
            <div key={stat.platform} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', textTransform: 'uppercase' }}>{stat.platform}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1' }}>{stat.count}</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#6366f1',
                    width: `${(stat.count / Math.max(...platformStats.map((s) => s.count))) * 100}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px' }}>Top Niches</h3>
          {nicheCounts.map((item) => (
            <div key={item.niche} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{item.niche}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#8b5cf6' }}>{item.count}</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: '#8b5cf6',
                    width: `${(item.count / Math.max(...nicheCounts.map((s) => s.count))) * 100}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonView({ offers, onBack, notes, isFavorite }: any) {
  if (offers.length === 0) {
    return (
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '60px 40px', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500', margin: 0 }}>Select 2-3 offers to compare</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Offer Comparison</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Side-by-side analysis of {offers.length} offers</p>
        </div>
        <button
          onClick={onBack}
          style={{
            background: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            padding: '10px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          Back to List
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700', color: '#1e293b' }}>Metric</th>
              {offers.map((offer: any) => (
                <th
                  key={offer.id}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '700',
                    color: '#1e293b',
                    minWidth: '200px',
                    background: '#f8fafc',
                  }}
                >
                  {offer.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Platform', key: 'platform', format: (v: any) => v.toUpperCase() },
              { label: 'Niche', key: 'niche' },
              { label: 'Status', key: 'status', format: (v: any) => v === 'active' ? 'Active' : 'Inactive' },
              { label: 'Momentum', key: 'momentum_tag', format: (v: any) => v || '—' },
              { label: 'Ads', key: 'num_ads' },
              { label: 'Creatives', key: 'num_creatives' },
              { label: 'Clicks', key: 'num_clicks', format: (v: any) => v || '—' },
              { label: 'Days Active', key: 'days_active', format: (v: any) => `${v}d` },
              { label: 'Language', key: 'language', format: (v: any) => v || '—' },
              { label: 'Product Type', key: 'product_type', format: (v: any) => v || '—' },
              { label: 'Structure', key: 'structure', format: (v: any) => v || '—' },
            ].map((row) => (
              <tr key={row.label} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b', background: '#f8fafc' }}>{row.label}</td>
                {offers.map((offer: any) => (
                  <td key={offer.id} style={{ padding: '12px 16px', color: '#64748b' }}>
                    {row.format ? row.format((offer as any)[row.key]) : (offer as any)[row.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
