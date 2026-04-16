import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useApp } from '../contexts/AppContext';

const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeView, setActiveView } = useApp();

  const handleNavChange = (id: string) => {
    setActiveView(id);
    setIsOpen(false);
  };

  return (
    <>
      <div className="mobile-navbar">
        <button 
          className="hamburger-btn" 
          onClick={() => setIsOpen(true)}
          aria-label="Open Menu"
        >
          <span className="hamburger-icon">☰</span>
        </button>
        <div className="mobile-logo" style={{ position: 'relative', overflow: 'hidden' }}>
          <span className="logo-icon">☠️</span>
          <span style={{
            background: 'linear-gradient(90deg, #fff 0%, #fff 45%, #6366f1 50%, #fff 55%, #fff 100%)',
            backgroundSize: '250% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'logoSweep 4s ease-in-out infinite',
            fontWeight: 900,
            display: 'flex',
            gap: '0.3rem'
          }}>
            Monstah <span style={{ color: 'inherit' }}>Reaper</span>
          </span>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes logoSweep {
              0% { background-position: 100% 0; }
              50% { background-position: 0% 0; }
              100% { background-position: 100% 0; }
            }
          `}} />
        </div>
        <div style={{ width: '40px' }} /> {/* Spacer to balance the header */}
      </div>

      <div className={`mobile-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
        <div className={`mobile-sidebar-container ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="mobile-sidebar-header">
            <div className="sidebar-logo">
              <span className="logo-icon">☠️</span>
              <span>Monstah <span>Reaper</span></span>
            </div>
            <button className="close-sidebar-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="mobile-sidebar-content">
            <Sidebar activeView={activeView} onNavChange={handleNavChange} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav;
