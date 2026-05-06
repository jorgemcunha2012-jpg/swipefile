import { useEffect, useState } from 'react';
import { getOffers } from './lib/supabase';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [offers, setOffers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    const { data } = await getOffers();
    setOffers(data || []);
    setLoading(false);
  };

  const filteredOffers = offers.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.niche.toLowerCase().includes(search.toLowerCase()) ||
      o.platform.toLowerCase().includes(search.toLowerCase())
  );

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
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'offers', label: 'All Offers' },
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
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 32px' }}>
        {page === 'dashboard' && <Dashboard offers={offers} />}
        {page === 'offers' && <AllOffers offers={filteredOffers} search={search} onSearch={setSearch} />}
      </main>
    </div>
  );
}

function Dashboard({ offers }: any) {
  const stats = [
    { label: 'Total Offers', value: offers.length, sublabel: 'Active campaigns' },
    { label: 'Escalating', value: offers.filter((o: any) => o.momentum_tag === 'escalating').length, sublabel: 'High momentum' },
    { label: 'Hot Offers', value: offers.filter((o: any) => o.momentum_tag === 'hot').length, sublabel: 'Trending now' },
    { label: 'Platforms', value: new Set(offers.map((o: any) => o.platform)).size, sublabel: 'Active channels' },
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
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}

function AllOffers({ offers, search, onSearch }: any) {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px' }}>Intelligence Library</h2>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          {offers.length} offer{offers.length !== 1 ? 's' : ''} found across all channels
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
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
              (e.currentTarget as HTMLInputElement).style.background = '#ffffff';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = '#e2e8f0';
              (e.currentTarget as HTMLInputElement).style.background = '#f8fafc';
            }}
          />
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
        </div>
      </div>

      {offers.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '60px 40px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '500', margin: 0 }}>No offers found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {offers.map((offer: any) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer }: any) {
  const getStatusColor = (status: string) => {
    return status === 'active' ? '#10b981' : '#6b7280';
  };

  const getMomentumLabel = (tag: string) => {
    switch (tag) {
      case 'escalating':
        return '📈 Escalating';
      case 'hot':
        return '🔥 Hot';
      default:
        return null;
    }
  };

  return (
    <div
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
        <span style={{ fontSize: '16px' }}>🤍</span>
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
          }}
        >
          {offer.status === 'active' ? '✓ Active' : 'Inactive'}
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
            }}
          >
            {getMomentumLabel(offer.momentum_tag)}
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
