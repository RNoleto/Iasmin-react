
import React, { useState, useEffect } from 'react';
import { View, SubscriptionLevel } from './types';
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
  // Definindo ELITE como padrão para remover limitações
  const [subscription, setSubscription] = useState<SubscriptionLevel>(SubscriptionLevel.ELITE);

  useEffect(() => {
    const verified = localStorage.getItem('iasmin_verified');
    if (verified === 'true') setIsVerified(true);
    
    // Forçamos ELITE independentemente do que estiver salvo para o teste atual
    setSubscription(SubscriptionLevel.ELITE);
  }, []);

  const handleVerify = () => {
    localStorage.setItem('iasmin_verified', 'true');
    setIsVerified(true);
  };

  const handleSubscribe = (level: SubscriptionLevel) => {
    setSubscription(level);
    localStorage.setItem('iasmin_sub', level);
    setCurrentView(View.HOME);
  };

  if (!isVerified) {
    return <AgeGate onVerify={handleVerify} />;
  }

  const renderView = () => {
    switch (currentView) {
      case View.HOME: return <HomeView onNavigate={setCurrentView} />;
      case View.STORIES: return <StoriesView subLevel={subscription} onNavigate={setCurrentView} />;
      case View.GALLERY: return <GalleryView subLevel={subscription} onNavigate={setCurrentView} />;
      case View.CHAT: return <ChatView subLevel={subscription} onNavigate={setCurrentView} />;
      case View.SUBSCRIPTION: return <SubscriptionView onSubscribe={handleSubscribe} />;
      default: return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col pb-20 md:pb-0 md:pt-16">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-6 md:pt-12">
        {renderView()}
      </main>
      
      <footer className="hidden md:block py-12 border-t border-white/5 mt-20 text-center text-zinc-700 text-[10px] uppercase tracking-widest">
        <p>&copy; 2024 Iasmin Exclusive. Todos os direitos reservados. Conteúdo Adulto +18.</p>
      </footer>
    </div>
  );
};

export default App;
