import { AppProvider, useApp } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import AssetDrawer from './components/AssetDrawer';
import Dashboard from './pages/Dashboard';
import Sentiment from './pages/Sentiment';
import Fundamental from './pages/Fundamental';
import Technical from './pages/Technical';
import AIInsight from './pages/AIInsight';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import './index.css';

function AppContent() {
  const { activeView, setActiveView } = useApp();

  const renderPage = () => {
    switch (activeView) {
      case 'sentiment': return <Sentiment />;
      case 'fundamental': return <Fundamental />;
      case 'technical': return <Technical />;
      case 'ai-insight': return <AIInsight />;
      case 'calendar': return <Calendar />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} onNavChange={setActiveView} />
      <main className="main-content">{renderPage()}</main>
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
