import React, { useState, useEffect } from 'react';
import { createAlert } from './api/alerts';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomeLanding } from './components/home/HomeLanding';
import { TouristApp } from './components/tourist/TouristApp';
import { AuthorityApp } from './components/authority/AuthorityApp';
import { MonumentDetailModal } from './components/tourist/MonumentDetailModal';
import { CrowdForecastPage } from './components/tourist/forecast/CrowdForecastPage';

import { MONUMENTS_DATA } from './data/monumentsData';
import { PRESET_DAMAGE_SCANS } from './data/damageScansData';
import { RECENT_ALERTS } from './data/authorityMetricsData';
import { Monument, DamageScanResult, AlertItem } from './types/heritage';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// Helper to determine the initial view from URL hash or localStorage, defaulting to 'home'
const getInitialView = (): 'home' | 'tourist' | 'authority' => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash.startsWith('forecast-') || hash === 'tourist') {
      return 'tourist';
    }
    if (hash === 'authority' || hash === 'home') {
      return hash as 'home' | 'authority';
    }
    const saved = localStorage.getItem('dharohar_active_view');
    if (saved === 'tourist' || saved === 'authority' || saved === 'home') {
      return saved as 'home' | 'tourist' | 'authority';
    }
  }
  return 'home';
};

export function App() {
  const [activeView, setActiveView] = useState<'home' | 'tourist' | 'authority'>(getInitialView);
  const [touristTab, setTouristTab] = useState<'discover' | 'itinerary' | 'scan' | 'ai-assistant' | 'saved'>('discover');
  const [authorityTab, setAuthorityTab] = useState<'overview' | 'monitoring' | 'analytics'>('overview');  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(null);
  const [forecastMonument, setForecastMonument] = useState<Monument | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash.startsWith('forecast-')) {
        const mId = hash.replace('forecast-', '');
        return MONUMENTS_DATA.find((m) => m.id === mId || m.name.toLowerCase().includes(mId.toLowerCase())) || null;
      }
    }
    return null;
  });
  const [citizenReports, setCitizenReports] = useState<DamageScanResult[]>(PRESET_DAMAGE_SCANS);
  const [alerts, setAlerts] = useState<AlertItem[]>(RECENT_ALERTS);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'alert' } | null>(null);

  // Sync activeView with browser URL hash and localStorage
  const handleViewChange = (view: 'home' | 'tourist' | 'authority') => {
    setForecastMonument(null);
    setActiveView(view);
    if (typeof window !== 'undefined') {
      window.location.hash = view;
      localStorage.setItem('dharohar_active_view', view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Ensure dark class is removed from html
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.removeItem('dharohar_theme');
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash.startsWith('forecast-')) {
        const mId = hash.replace('forecast-', '');
        const found = MONUMENTS_DATA.find((m) => m.id === mId || m.name.toLowerCase().includes(mId.toLowerCase()));
        if (found) {
          setForecastMonument(found);
          setSelectedMonument(null);
          setActiveView('tourist');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      if (hash === 'tourist' || hash === 'authority' || hash === 'home') {
        setForecastMonument(null);
        setActiveView(hash as 'home' | 'tourist' | 'authority');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const showToast = (title: string, desc: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleReportSubmitted = async (newScan: DamageScanResult) => {
    // Keep the local citizen-report UI in sync immediately.
    setCitizenReports((prev) => [newScan, ...prev]);

    // Persist the damage alert in the backend.
    try {
      const siteId = newScan.monumentId;

      await createAlert({
        site_id: siteId,
        title: `Citizen Damage Scan: ${newScan.monumentName.split('(')[0].trim()}`,
        alert_type: 'DAMAGE',
        severity:
          newScan.overallDamageScore >= 80
            ? 'CRITICAL'
            : newScan.overallDamageScore >= 60
            ? 'HIGH'
            : newScan.overallDamageScore >= 30
            ? 'MEDIUM'
            : 'LOW',
        message:
          `New surface anomaly detected. Damage Score: ` +
          `${newScan.overallDamageScore}/100.`,
      });

      console.log('BACKEND DAMAGE ALERT CREATED');
    } catch (error) {
      console.error('Failed to create backend damage alert:', error);
    }

    // Keep the existing local alert UI in sync as well.
    const newAlert: AlertItem = {
      id: 'alt-' + Date.now(),
      type: 'damage',
      severity:
        newScan.overallDamageScore >= 80
          ? 'critical'
          : newScan.overallDamageScore >= 60
          ? 'high'
          : newScan.overallDamageScore >= 30
          ? 'medium'
          : 'low',
      title: `Citizen Damage Scan: ${newScan.monumentName.split('(')[0].trim()}`,
      monumentName: newScan.monumentName,
      timeAgo: 'Just now',
      timestamp: new Date().toLocaleTimeString(),
      status: 'unread',
      details:
        `New surface anomaly detected ` +
        `(Score: ${newScan.overallDamageScore}/100). ` +
        `Review in Authority Portal.`
    };

    setAlerts((prev) => [newAlert, ...prev]);

    showToast(
      'Citizen Report Logged!',
      'Your damage scan was sent directly to the ASI Heritage Control Center.'
    );
  };

  const handleDispatchTeam = (monumentName: string, actionType: string) => {
    showToast(
      'Action Dispatched',
      `${actionType} ordered for ${monumentName}. Status updated in live registry.`
    );
  };

  const handleThrottleFootfall = (monumentName: string) => {
    showToast(
      'Tourist Diversion Flow Activated',
      `Online ticketing throttled for ${monumentName}. Incoming tourists redirected to eco-alternative sites.`,
      'alert'
    );
  };

  const handleSelectAlternative = (altId: string) => {
    const target = MONUMENTS_DATA.find((m) => m.id === altId || m.name.toLowerCase().includes(altId.toLowerCase()));
    if (target) {
      setSelectedMonument(target);
    } else {
      setSelectedMonument(null);
    }
  };

  const handleOpenCrowdForecast = (monument: Monument) => {
    setSelectedMonument(null);
    setForecastMonument(monument);
    setActiveView('tourist');
    if (typeof window !== 'undefined') {
      window.location.hash = `forecast-${monument.id}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackFromForecast = (monument: Monument) => {
    setForecastMonument(null);
    setSelectedMonument(monument);
    if (typeof window !== 'undefined') {
      window.location.hash = 'tourist';
    }
  };

  const handlePlanVisitFromForecast = (monument: Monument) => {
    setForecastMonument(null);
    setSelectedMonument(null);
    setTouristTab('itinerary');
    handleViewChange('tourist');
    showToast(
      'AI Visiting Slot Applied!',
      `Itinerary customized for ${monument.name} around the optimal low-crowd window.`
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      activeView === 'authority' ? 'bg-[#F4F6F9] text-[#1A202C]' : 'bg-[#F8F6F0] text-[#1A2621]'
    }`}>
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp bg-[#0C1527] text-white p-4 rounded-2xl shadow-2xl border border-[#D4AF37]/40 max-w-sm flex items-start space-x-3">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-xs font-bold text-white">{toastMessage.title}</h4>
            <p className="text-[11px] text-white/80 mt-0.5 leading-snug">{toastMessage.desc}</p>
          </div>
        </div>
      )}

      {/* Unified Global Navbar with Contextual Intelligence */}
      <Navbar
        activeView={activeView}
        onViewChange={handleViewChange}
        touristTab={touristTab}
        onTouristTabChange={(tab) => {
          setForecastMonument(null);
          setTouristTab(tab);
        }}
        authorityTab={authorityTab}
        onAuthorityTabChange={setAuthorityTab}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Full-Width Content Area */}
      <main className="flex-1">
        {activeView === 'home' && (
          <HomeLanding
            language={language}
            onNavigateToTourist={() => handleViewChange('tourist')}
            onNavigateToAuthority={() => handleViewChange('authority')}
          />
        )}

        {activeView === 'tourist' && (
          forecastMonument ? (
            <CrowdForecastPage
              monument={forecastMonument}
              language={language}
              onBackToMonument={handleBackFromForecast}
              onPlanVisit={handlePlanVisitFromForecast}
            />
          ) : (
            <TouristApp
              language={language}
              activeTab={touristTab}
              onTabChange={setTouristTab}
              onSelectMonument={(m) => setSelectedMonument(m)}
              onReportSubmitted={handleReportSubmitted}
            />
          )
        )}

        {activeView === 'authority' && (
          <AuthorityApp
            language={language}
            activeTab={authorityTab}
            onTabChange={setAuthorityTab}
            citizenReports={citizenReports}
            alerts={alerts}
            onDispatchTeam={handleDispatchTeam}
            onThrottleFootfall={handleThrottleFootfall}
            onActionAlert={(alertId: string) => {
              showToast('Action Taken', `Action logged for alert ${alertId}.`);
            }}
          />
        )}
      </main>

      {/* Universal Monument Detail Modal */}
      {selectedMonument && (
        <MonumentDetailModal
          monument={selectedMonument}
          language={language}
          onClose={() => setSelectedMonument(null)}
          onSelectAlternative={handleSelectAlternative}
          onOpenScanner={() => {
            setSelectedMonument(null);
            setTouristTab('scan');
            handleViewChange('tourist');
          }}
          onOpenCrowdForecast={handleOpenCrowdForecast}
        />
      )}

      {/* Common Footer */}
      <Footer 
        language={language} 
        onViewChange={handleViewChange} 
      />
    </div>
  );
}

export default App;