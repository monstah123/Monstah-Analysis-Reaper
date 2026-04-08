import React, { useState } from 'react';
import { Search, Globe, ShieldCheck, Newspaper, ExternalLink, Loader2 } from 'lucide-react';

interface Source {
  title: string;
  url: string;
  content: string;
}

export default function Researcher() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{ answer: string; sources: Source[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) {
        setReport({ answer: data.answer, sources: data.sources });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="title-group">
          <h1>Global Intelligence</h1>
          <p className="subtitle">Live Web Crawler & Institutional Researcher</p>
        </div>
        <div className="status-badge live">
          <Globe size={14} />
          WORLDWIDE ACCESS
        </div>
      </header>

      <div className="research-grid">
        <section className="search-box">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for retail/institutional sentiment, COT reports, or any market data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
            </button>
          </form>
          <div className="search-tags">
            <span onClick={() => setQuery("Live retail sentiment EURUSD Myfxbook")}>EURUSD Retail</span>
            <span onClick={() => setQuery("Latest COT report Gold analysis")}>Gold COT</span>
            <span onClick={() => setQuery("Institutional positioning S&P 500")}>Equity Positioning</span>
          </div>
        </section>

        {report && (
          <div className="report-container fade-in">
            <div className="answer-section">
              <div className="section-header">
                <ShieldCheck className="icon-green" />
                <h3>Intelligence Report</h3>
              </div>
              <div className="answer-box">
                <p>{report.answer}</p>
              </div>
            </div>

            <div className="sources-section">
              <div className="section-header">
                <Newspaper className="icon-blue" />
                <h3>Verified Sources</h3>
              </div>
              <div className="sources-list">
                {report.sources.map((src, i) => (
                  <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="source-link">
                    <div className="source-info">
                      <span className="source-title">{src.title}</span>
                      <span className="source-url">{src.url}</span>
                    </div>
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {!report && !loading && (
          <div className="empty-state">
            <Globe className="faint-icon" size={80} />
            <h2>System Ready</h2>
            <p>Enter a query to crawl the internet for real-time market data.</p>
          </div>
        )}
      </div>

      <style>{`
        .research-grid {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 1rem;
        }
        .search-form {
          display: flex;
          gap: 1rem;
          background: rgba(30, 41, 59, 0.5);
          padding: 0.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .search-form input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 0.8rem;
          font-size: 1.1rem;
          outline: none;
        }
        .search-form button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .search-form button:hover {
          background: #2563eb;
        }
        .search-tags {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .search-tags span {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }
        .search-tags span:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .report-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        .answer-box {
          background: rgba(30, 41, 59, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 16px;
          line-height: 1.6;
          color: #e2e8f0;
          font-size: 1.05rem;
          white-space: pre-wrap;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .section-header h3 {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.9rem;
          color: #94a3b8;
        }
        .source-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(30, 41, 59, 0.5);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 0.75rem;
          text-decoration: none;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .source-link:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }
        .source-title {
          display: block;
          color: #f8fafc;
          font-weight: 500;
          font-size: 0.95rem;
          margin-bottom: 0.2rem;
        }
        .source-url {
          display: block;
          color: #64748b;
          font-size: 0.8rem;
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .empty-state {
          text-align: center;
          padding: 5rem 0;
          color: #475569;
        }
        .faint-icon {
          opacity: 0.1;
          margin-bottom: 1.5rem;
        }
        .icon-green { color: #22c55e; }
        .icon-blue { color: #3b82f6; }
        @media (max-width: 1024px) {
          .report-container { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
