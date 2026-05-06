import { useEffect, useState } from 'react';
import { supabase, signIn, signUp, signOut, getOffers, getSavedOffers, toggleSavedOffer } from './lib/supabase';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [offers, setOffers] = useState<any[]>([]);
  const [savedOffers, setSavedOffers] = useState<any[]>([]);
  const [isSignUp, setIsSignUp] = useState(false);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => data?.subscription.unsubscribe();
  }, []);

  // Load offers
  useEffect(() => {
    if (user) loadOffers();
  }, [user]);

  const loadOffers = async () => {
    const { data, error } = await getOffers();
    if (error) console.error(error);
    else setOffers(data || []);

    const { data: saved } = await getSavedOffers(user.id);
    setSavedOffers(saved || []);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
      if (error) alert('Erro: ' + error.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setEmail('');
    setPassword('');
  };

  const toggleSaved = async (offerId: string) => {
    await toggleSavedOffer(user.id, offerId);
    loadOffers();
  };

  const isSaved = (offerId: string) => savedOffers.some((s) => s.offer_id === offerId);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Carregando...</div>;

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            background: '#1e293b',
            padding: '32px',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
            SwipeOffers
          </h1>
          <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '24px' }}>
            Inteligência Competitiva de Ofertas
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }}>
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginTop: '16px' }}>
            {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isSignUp ? 'Entrar' : 'Criar'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '8px', border: '1px solid #334155' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Total de Ofertas</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{offers.length}</p>
        </div>
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '8px', border: '1px solid #334155' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Escalando</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
            {offers.filter((o) => o.momentum_tag === 'escalating').length}
          </p>
        </div>
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '8px', border: '1px solid #334155' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Salvos</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{savedOffers.length}</p>
        </div>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Ofertas Ativas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {offers
          .filter((o) => o.status === 'active')
          .map((offer) => (
            <div
              key={offer.id}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <h4 style={{ fontWeight: 'bold' }}>{offer.name}</h4>
                <button
                  onClick={() => toggleSaved(offer.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                  }}
                >
                  {isSaved(offer.id) ? '❤️' : '🤍'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <p style={{ color: '#94a3b8' }}>Anúncios</p>
                  <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{offer.num_ads}</p>
                </div>
                <div>
                  <p style={{ color: '#94a3b8' }}>Criativos</p>
                  <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{offer.num_creatives}</p>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '12px' }}>
                {offer.platform} • {offer.niche}
              </p>
            </div>
          ))}
      </div>
    </div>
  );

  const renderOffers = () => (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Todas as Ofertas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {offers.map((offer) => (
          <div
            key={offer.id}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <h4 style={{ fontWeight: 'bold', flex: 1 }}>{offer.name}</h4>
              <button
                onClick={() => toggleSaved(offer.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  marginLeft: '8px',
                }}
              >
                {isSaved(offer.id) ? '❤️' : '🤍'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  background: '#0f172a',
                  borderRadius: '4px',
                  color: offer.status === 'active' ? '#10b981' : '#ef4444',
                }}
              >
                {offer.status === 'active' ? '✓ Ativo' : 'Inativo'}
              </span>
              {offer.momentum_tag && (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#0f172a',
                    borderRadius: '4px',
                    color: offer.momentum_tag === 'escalating' ? '#ef4444' : '#f59e0b',
                  }}
                >
                  {offer.momentum_tag === 'escalating' ? '📈 Escalando' : '🔥 Hot'}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px', marginBottom: '12px' }}>
              <div>
                <p style={{ color: '#94a3b8' }}>Anúncios</p>
                <p style={{ fontWeight: 'bold' }}>{offer.num_ads}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8' }}>Criativos</p>
                <p style={{ fontWeight: 'bold' }}>{offer.num_creatives}</p>
              </div>
              <div>
                <p style={{ color: '#94a3b8' }}>Dias</p>
                <p style={{ fontWeight: 'bold' }}>{offer.days_active}D</p>
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>
              {offer.platform} • {offer.niche}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>Meus Favoritos</h2>
      {savedOffers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <p>Nenhuma oferta salva ainda</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {offers
            .filter((o) => savedOffers.some((s) => s.offer_id === o.id))
            .map((offer) => (
              <div
                key={offer.id}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <h4 style={{ fontWeight: 'bold' }}>{offer.name}</h4>
                  <button
                    onClick={() => toggleSaved(offer.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                    }}
                  >
                    ❤️
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <p style={{ color: '#94a3b8' }}>Anúncios</p>
                    <p style={{ fontWeight: 'bold' }}>{offer.num_ads}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8' }}>Criativos</p>
                    <p style={{ fontWeight: 'bold' }}>{offer.num_creatives}</p>
                  </div>
                  <div>
                    <p style={{ color: '#94a3b8' }}>Dias</p>
                    <p style={{ fontWeight: 'bold' }}>{offer.days_active}D</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <header style={{ background: '#0f172a', borderBottom: '1px solid #334155', marginBottom: '32px' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>SwipeOffers</h1>
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <button
              onClick={() => setPage('dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: page === 'dashboard' ? '#3b82f6' : 'white',
                cursor: 'pointer',
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPage('offers')}
              style={{
                background: 'none',
                border: 'none',
                color: page === 'offers' ? '#3b82f6' : 'white',
                cursor: 'pointer',
              }}
            >
              Ofertas
            </button>
            <button
              onClick={() => setPage('favorites')}
              style={{
                background: 'none',
                border: 'none',
                color: page === 'favorites' ? '#3b82f6' : 'white',
                cursor: 'pointer',
              }}
            >
              Favoritos ({savedOffers.length})
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        {page === 'dashboard' && renderDashboard()}
        {page === 'offers' && renderOffers()}
        {page === 'favorites' && renderFavorites()}
      </main>
    </div>
  );
}
