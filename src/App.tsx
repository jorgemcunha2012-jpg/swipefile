import { useEffect, useState } from 'react';
import { getOffers, toggleSavedOffer } from './lib/supabase';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [offers, setOffers] = useState<any[]>([]);
  const [savedOffers, setSavedOffers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    const { data, error } = await getOffers();
    if (error) console.error(error);
    else setOffers(data || []);
    setSavedOffers([]);
    setLoading(false);
  };

  const toggleSaved = async (offerId: string) => {
    await toggleSavedOffer('demo-user', offerId);
    loadOffers();
  };

  const isSaved = (_offerId: string) => false;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#cbd5e1', fontSize: '16px' }}>Loading offers...</div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Dashboard</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Monitor your competitive intelligence in real-time</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Total Offers', value: offers.length, icon: '📊', color: '#60a5fa' },
          { label: 'Escalating', value: offers.filter((o) => o.momentum_tag === 'escalating').length, icon: '📈', color: '#ef4444' },
          { label: 'Saved', value: savedOffers.length, icon: '💾', color: '#8b5cf6' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: `1px solid rgba(96, 165, 250, 0.1)`,
              borderRadius: '12px',
              padding: '28px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: '40px', fontWeight: '800', color: 'white' }}>{stat.value}</p>
              </div>
              <div style={{ fontSize: '32px' }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Active Offers
        </h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {offers
          .filter((o) => o.status === 'active')
          .map((offer) => (
            <div
              key={offer.id}
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(96, 165, 250, 0.3)';
                (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(148, 163, 184, 0.1)';
                (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <h4 style={{ fontWeight: '700', color: 'white', fontSize: '15px', flex: 1 }}>{offer.name}</h4>
                <button
                  onClick={() => toggleSaved(offer.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    marginLeft: '12px',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)';
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  }}
                >
                  {isSaved(offer.id) ? '❤️' : '🤍'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>ADS</p>
                  <p style={{ fontWeight: '700', fontSize: '20px', color: '#60a5fa' }}>{offer.num_ads}</p>
                </div>
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>CREATIVES</p>
                  <p style={{ fontWeight: '700', fontSize: '20px', color: '#a78bfa' }}>{offer.num_creatives}</p>
                </div>
              </div>
              <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>
                {offer.platform.toUpperCase()} • {offer.niche}
              </p>
            </div>
          ))}
      </div>
    </div>
  );

  const renderOffers = () => (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>All Offers</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>{offers.length} active offers across all platforms</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {offers.map((offer) => (
          <div
            key={offer.id}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(96, 165, 250, 0.3)';
              (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(148, 163, 184, 0.1)';
              (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <h4 style={{ fontWeight: '700', color: 'white', fontSize: '15px', flex: 1 }}>{offer.name}</h4>
              <button
                onClick={() => toggleSaved(offer.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  marginLeft: '12px',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                }}
              >
                {isSaved(offer.id) ? '❤️' : '🤍'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  background: offer.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: offer.status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: offer.status === 'active' ? '#86efac' : '#fca5a5',
                  fontWeight: '600',
                }}
              >
                {offer.status === 'active' ? '✓ Active' : 'Inactive'}
              </span>
              {offer.momentum_tag && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '6px 12px',
                    background: offer.momentum_tag === 'escalating' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 146, 60, 0.1)',
                    border: offer.momentum_tag === 'escalating' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(251, 146, 60, 0.3)',
                    borderRadius: '6px',
                    color: offer.momentum_tag === 'escalating' ? '#fca5a5' : '#fdba74',
                    fontWeight: '600',
                  }}
                >
                  {offer.momentum_tag === 'escalating' ? '📈 Escalating' : '🔥 Hot'}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>ADS</p>
                <p style={{ fontWeight: '700', fontSize: '18px', color: '#60a5fa' }}>{offer.num_ads}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>CREATIVES</p>
                <p style={{ fontWeight: '700', fontSize: '18px', color: '#a78bfa' }}>{offer.num_creatives}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>DAYS</p>
                <p style={{ fontWeight: '700', fontSize: '18px', color: '#f59e0b' }}>{offer.days_active}D</p>
              </div>
            </div>

            <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>
              {offer.platform.toUpperCase()} • {offer.niche}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Saved Offers</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>{savedOffers.length} offer{savedOffers.length !== 1 ? 's' : ''} saved</p>
      </div>

      {savedOffers.length === 0 ? (
        <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.5) 100%)', border: '1px dashed rgba(148, 163, 184, 0.2)', borderRadius: '12px', padding: '60px 40px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '500' }}>No saved offers yet</p>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>Start saving offers from the catalog to build your collection</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {offers
            .filter((o) => savedOffers.includes(o.id))
            .map((offer) => (
              <div
                key={offer.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(148, 163, 184, 0.1)';
                  (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <h4 style={{ fontWeight: '700', color: 'white', fontSize: '15px', flex: 1 }}>{offer.name}</h4>
                  <button
                    onClick={() => toggleSaved(offer.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      marginLeft: '12px',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)';
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    }}
                  >
                    ❤️
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>ADS</p>
                    <p style={{ fontWeight: '700', fontSize: '18px', color: '#60a5fa' }}>{offer.num_ads}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>CREATIVES</p>
                    <p style={{ fontWeight: '700', fontSize: '18px', color: '#a78bfa' }}>{offer.num_creatives}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', fontWeight: '600' }}>DAYS</p>
                    <p style={{ fontWeight: '700', fontSize: '18px', color: '#f59e0b' }}>{offer.days_active}D</p>
                  </div>
                </div>

                <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>
                  {offer.platform.toUpperCase()} • {offer.niche}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh' }}>
      <header style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', backgroundClip: 'text', color: 'transparent', letterSpacing: '-0.5px' }}>
            DARK OFFERs
          </h1>
          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {['dashboard', 'offers', 'favorites'].map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: page === p ? '#60a5fa' : '#cbd5e1',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: page === p ? '600' : '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease',
                  paddingBottom: '8px',
                  borderBottom: page === p ? '2px solid #60a5fa' : '2px solid transparent',
                }}
                onMouseOver={(e) => {
                  if (page !== p) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#93c5fd';
                  }
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = page === p ? '#60a5fa' : '#cbd5e1';
                }}
              >
                {p === 'dashboard' ? 'Dashboard' : p === 'offers' ? 'Offers' : `Saved (${savedOffers.length})`}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        {page === 'dashboard' && renderDashboard()}
        {page === 'offers' && renderOffers()}
        {page === 'favorites' && renderFavorites()}
      </main>
    </div>
  );
}
