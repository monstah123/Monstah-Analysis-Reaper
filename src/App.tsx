import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { AppProvider, useApp } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import AssetDrawer from './components/AssetDrawer';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import Sentiment from './pages/Sentiment';
import Fundamental from './pages/Fundamental';
import Technical from './pages/Technical';
import AIInsight from './pages/AIInsight';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Watchlist from './pages/Watchlist';
import LoginPage from './pages/LoginPage';
import './index.css';

import Correlation from './pages/Correlation';
import COTDeepDive from './pages/COTDeepDive';
import YieldSpreads from './pages/YieldSpreads';
import NewsTerminal from './pages/NewsTerminal';
import ReaperSnatcher from './components/ReaperSnatcher';
import Landing from './pages/Landing';
import Researcher from './pages/Researcher';
import BacktestLab from './pages/BacktestLab';

function AppContent() {
  const { activeView, setActiveView } = useApp();

  const renderPage = () => {
    switch (activeView) {
      case 'landing':       return <Landing />;
      case 'watchlist':    return <Watchlist />;
      case 'sentiment':    return <Sentiment />;
      case 'fundamental':  return <Fundamental />;
      case 'technical':    return <Technical />;
      case 'yield-spreads':  return <YieldSpreads />;
      case 'news-terminal':  return <NewsTerminal />;
      case 'ai-insight':     return <AIInsight />;
      case 'calendar':       return <Calendar />;
      case 'correlation':    return <Correlation />;
      case 'cot-deep-dive':  return <COTDeepDive />;
      case 'research':       return <Researcher />;
      case 'backtest':       return <BacktestLab />;
      case 'settings':       return <Settings />;
      default:               return <Dashboard />;
    }
  };

  const isLanding = activeView === 'landing';

  return (
    <div className={`app-container ${isLanding ? 'is-landing' : ''}`}>
      {!isLanding && (
        <div className="desktop-sidebar-wrapper">
          <Sidebar activeView={activeView} onNavChange={setActiveView} />
        </div>
      )}
      <div className="app-body">
        {!isLanding && <MobileNav />}
        <main className={isLanding ? 'landing-content' : 'main-content'}>{renderPage()}</main>
      </div>
      {!isLanding && <AssetDrawer />}
    </div>
  );
}

// Gates the full app behind auth
function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="loading-spinner" />
        <p>Loading Monstah Reaper…</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <WatchlistProvider>
        <ReaperSnatcher />
        <AppContent />
      </WatchlistProvider>
    </AppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
