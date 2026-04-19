import React, { useState, useEffect } from 'react';

interface OutcomeData {
  outcomePrices: string[];
  outcomes: string[];
}

interface PolymarketEvent {
  id: string;
  title: string;
  description: string;
  image: string;
  volume: number;
  slug: string;
  markets: OutcomeData[];
}

const Polymarket: React.FC = () => {
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/polymarket');
      const data = await response.json();
      // Sort by volume so the biggest/most popular markets are shown
      const sorted = data.sort((a: PolymarketEvent, b: PolymarketEvent) => (b.volume || 0) - (a.volume || 0));
      setEvents(sorted);
    } catch (error) {
      console.error('Failed to fetch Polymarket data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // Refresh every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="title-group">
          <h1>🔮 Polymarket Live</h1>
          <p className="subtitle">Real-time prediction markets and smart money betting flow</p>
        </div>
        <div className="status-badge live">
          <span className="animate-pulse" style={{ width: '8px', height: '8px', background: '#eab308', borderRadius: '50%', display: 'inline-block' }}></span>
          GAMMA API SYNCED
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#3b82f6' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="settings-row-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {events.map((event) => {
            // Grab the primary market data for pricing
            const mainMarket = event.markets && event.markets.length > 0 ? event.markets[0] : null;
            let outcomes: string[] = [];
            let prices: number[] = [];

            if (mainMarket && mainMarket.outcomes && mainMarket.outcomePrices) {
              try {
                const parsedOutcomes = JSON.parse(mainMarket.outcomes as any);
                const parsedPrices = JSON.parse(mainMarket.outcomePrices as any).map(Number);
                outcomes = parsedOutcomes;
                prices = parsedPrices;
              } catch (e) {
                // Ignore missing outcomes
              }
            }

            return (
              <a key={event.id} href={`https://polymarket.com/event/${event.slug}`} target="_blank" rel="noopener noreferrer" className="settings-card" style={{ 
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                overflow: 'hidden',
                padding: '0', // We use custom padding layout here
                textDecoration: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={event.image || 'https://via.placeholder.com/400x200?text=Polymarket+Event'} 
                    alt={event.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                  />
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                     <span>💸</span> Vol: ${(event.volume || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', lineHeight: 1.4 }}>
                    {event.title}
                  </h3>

                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {outcomes.length > 0 ? (
                      outcomes.map((outcome, idx) => {
                        const probability = (prices[idx] || 0) * 100;
                        return (
                          <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>{outcome}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ color: '#3b82f6', fontWeight: 800 }}>{probability.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
                        Multiple conditional outcomes
                      </div>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Polymarket;
