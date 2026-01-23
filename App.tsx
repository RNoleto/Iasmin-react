
import React, { useState, useEffect } from 'react';
import { View } from './types';
import HomeView from './components/templates/HomeView';
import StoriesView from './components/templates/StoriesView';
import GalleryView from './components/templates/GalleryView';
import ChatView from './components/templates/ChatView';
import SubscriptionView from './components/templates/SubscriptionView';
import Navbar from './components/organisms/Navbar';
import AgeGate from './components/organisms/AgeGate';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage for age verification
    const verified = localStorage.getItem('iasmin_verified');
    if (verified === 'true') setIsVerified(true);
  }, []);

  const handleVerify = () => {
    localStorage.setItem('iasmin_verified', 'true');
    setIsVerified(true);
  };

  if (!isVerified) {
    return <AgeGate onVerify={handleVerify} />;
  }

  const renderView = () => {
    switch (currentView) {
      case View.HOME: return <HomeView onNavigate={setCurrentView} />;
      case View.STORIES: return <StoriesView />;
      case View.GALLERY: return <GalleryView />;
      case View.CHAT: return <ChatView />;
      case View.SUBSCRIPTION: return <SubscriptionView />;
      default: return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col pb-20 md:pb-0 md:pt-16">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-6 md:pt-12 animate-fade-in">
        {renderView()}
      </main>
      
      {/* Footer / Contact for desktop */}
      <footer className="hidden md:block py-12 border-t border-zinc-900 mt-20 text-center text-zinc-600 text-sm">
        <p>&copy; 2024 IASmin Exclusive. Todos os direitos reservados. +18 Apenas.</p>
      </footer>
    </div>
  );
};

export default App;
