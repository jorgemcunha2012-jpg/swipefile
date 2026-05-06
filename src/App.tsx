import { useEffect, useState } from 'react';
import { getOffers, toggleSavedOffer } from './lib/supabase';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [offers, setOffers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    const { data, error } = await getOffers();
    if (error) console.error(error);
    else setOffers(data || []);
    setLoading(false);
  };

  const toggleSaved = async (offerId: string) => {
    await toggleSavedOffer('demo-user', offerId);
    loadOffers();
  };

  const filteredOffers = offers.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.niche.toLowerCase().includes(search.toLowerCase()) ||
    o.platform.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1a1f3a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(96, 165, 250, 0.2)', borderTop: '3px solid #60a5fa', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
          <div style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>Loading intelligence data...</div>
        </div>
        <style>
          {`@keyframes spin { to { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Offers',
      value: offers.length,
      change: '+12%',
      icon: '📊',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      valueColor: '#3b82f6',
    },
    {
      label: 'Escalating',
      value: offers.filter((o) => o.momentum_tag === 'escalating').length,
      change: '+5%',
      icon: '🚀',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      valueColor: '#ef4444',
    },
    {
      label: 'Hot Offers',
      value: offers.filter((o) => o.momentum_tag === 'hot').length,
      change: '+8%',
      icon: '🔥',
      bgColor: 'rgba(251, 146, 60, 0.1)',
      borderColor: 'rgba(251, 146, 60, 0.3)',
      valueColor: '#fb923c',
    },
    {
      label: 'Active',
      value: offers.filter((o) => o.status === 'active').length,
      change: '100%',
      icon: '✅',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      valueColor: '#10b981',
    },
  ];

  const renderHeader = () => (
    <header style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%)', borderBottom: '1px solid rgba(148, 163, 184, 0.1)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', backgroundClip: 'text', color: 'transparent', letterSpacing: '-0.5px', margin: 0 }}>
            DARK OFFERs
          </h1>
          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '4px', letterSpacing: '1px' }}>COMPETITIVE INTELLIGENCE ENGINE</p>
        </div>

        <nav style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📈' },
            { id: 'offers', label: 'All Offers', icon: '📋' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                background: page === item.id ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.1) 100%)' : 'transparent',
                border: page === item.id ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid transparent',
                color: page === item.id ? '#93c5fd' : '#94a3b8',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: page === item.id ? '600' : '500',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                if (page !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(96, 165, 250, 0.05)';
                }
              }}
              onMouseOut={(e) => {
                if (page !== item.id) {
                  (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );

  const renderDashboard = () => (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', margin: 0 }}>Dashboard</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px', fontWeight: '500' }}>Real-time market intelligence and competitive analysis</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: `linear-gradient(135deg, ${stat.bgColor} 0%, rgba(20, 29, 50, 0.4) 100%)`,
              border: `1px solid ${stat.borderColor}`,
              borderRadius: '12px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = stat.valueColor;
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = stat.borderColor;
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <p style={{ fontSize: '36px', fontWeight: '800', color: stat.valueColor, margin: 0 }}>{stat.value}</p>
              <p style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Top Performing Offers
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {offers.slice(0, 6).map((offer) => (
          <OfferCard key={offer.id} offer={offer} onToggleSave={toggleSaved} isSaved={false} />
        ))}
      </div>
    </div>
  );

  const renderOffers = () => (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'white', margin: 0 }}>Intelligence Library</h2>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px', fontWeight: '500' }}>
          {filteredOffers.length} offer{filteredOffers.length !== 1 ? 's' : ''} found • Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by name, niche, or platform..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(96, 165, 250, 0.4)';
              (e.currentTarget as HTMLInputElement).style.background = 'rgba(30, 41, 59, 0.8)';
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(148, 163, 184, 0.2)';
              (e.currentTarget as HTMLInputElement).style.background = 'rgba(30, 41, 59, 0.6)';
            }}
          />
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '16px' }}>🔍</span>
        </div>
      </div>

      {filteredOffers.length === 0 ? (
        <div style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px dashed rgba(148, 163, 184, 0.2)', borderRadius: '12px', padding: '60px 40px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '600' }}>No offers found</p>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onToggleSave={toggleSaved} isSaved={false} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1a1f3a 100%)', minHeight: '100vh' }}>
      {renderHeader()}
      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '40px 32px' }}>
        {page === 'dashboard' && renderDashboard()}
        {page === 'offers' && renderOffers()}
      </main>
    </div>
  );
}

function OfferCard({ offer, onToggleSave, isSaved }: any) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', color: '#86efac', label: '✓ Active' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.3)', color: '#d1d5db', label: 'Inactive' };
    }
  };

  const getMomentumStyle = (tag: string) => {
    switch (tag) {
      case 'escalating':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5', label: '📈 Escalating' };
      case 'hot':
        return { bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.3)', color: '#fdba74', label: '🔥 Hot' };
      default:
        return { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', color: '#e9d5ff', label: '🎯 Tracking' };
    }
  };

  const statusStyle = getStatusStyle(offer.status);
  const momentumStyle = offer.momentum_tag ? getMomentumStyle(offer.momentum_tag) : null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(20, 29, 50, 0.5) 100%)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(96, 165, 250, 0.3)';
        (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(20, 29, 50, 0.8) 100%)';
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(148, 163, 184, 0.1)';
        (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(20, 29, 50, 0.5) 100%)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <h4 style={{ fontWeight: '700', color: 'white', fontSize: '15px', flex: 1, margin: 0, lineHeight: 1.4 }}>
          {offer.name}
        </h4>
        <button
          onClick={() => onToggleSave(offer.id)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            marginLeft: '12px',
            transition: 'transform 0.2s ease',
            padding: 0,
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.3)';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          {isSaved ? '❤️' : '🤍'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '11px',
            padding: '6px 12px',
            background: statusStyle.bg,
            border: `1px solid ${statusStyle.border}`,
            borderRadius: '6px',
            color: statusStyle.color,
            fontWeight: '700',
          }}
        >
          {statusStyle.label}
        </span>
        {momentumStyle && (
          <span
            style={{
              fontSize: '11px',
              padding: '6px 12px',
              background: momentumStyle.bg,
              border: `1px solid ${momentumStyle.border}`,
              borderRadius: '6px',
              color: momentumStyle.color,
              fontWeight: '700',
            }}
          >
            {momentumStyle.label}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, marginBottom: '4px' }}>Ads</p>
          <p style={{ fontWeight: '800', fontSize: '20px', color: '#60a5fa', margin: 0 }}>{offer.num_ads}</p>
        </div>
        <div>
          <p style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0, marginBottom: '4px' }}>Creatives</p>
          <p style={{ fontWeight: '800', fontSize: '20px', color: '#a78bfa', margin: 0 }}>{offer.num_creatives}</p>
        </div>
      </div>

      <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(148, 163, 184, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', margin: 0 }}>
          {offer.platform.toUpperCase()} • {offer.niche}
        </p>
        <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '500', margin: 0 }}>{offer.days_active}d active</p>
      </div>
    </div>
  );
}
