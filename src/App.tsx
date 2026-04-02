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
import './index.css';

import Correlation from './pages/Correlation';
import COTDeepDive from './pages/COTDeepDive';
import YieldSpreads from './pages/YieldSpreads';

function AppContent() {
  const { activeView, setActiveView } = useApp();

  const renderPage = () => {
    switch (activeView) {
      case 'sentiment': return <Sentiment />;
      case 'fundamental': return <Fundamental />;
      case 'technical': return <Technical />;
      case 'yield-spreads': return <YieldSpreads />;
      case 'ai-insight': return <AIInsight />;
      case 'calendar': return <Calendar />;
      case 'correlation': return <Correlation />;
      case 'cot-deep-dive': return <COTDeepDive />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <div className="desktop-sidebar-wrapper">
        <Sidebar activeView={activeView} onNavChange={setActiveView} />
      </div>
      <div className="app-body">
        <MobileNav />
        <main className="main-content">{renderPage()}</main>
      </div>
      <AssetDrawer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
