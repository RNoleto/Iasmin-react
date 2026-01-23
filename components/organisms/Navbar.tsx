
import React from 'react';
import { View } from '../../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Icons = {
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="10"/></svg>
  ),
  Stories: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  ),
  Gallery: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18M12 3v18"/></svg>
  ),
  Chat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.2h.1l3.3-3.3L16 4h4a1 1 0 0 1 1 1v6.5z"/></svg>
  ),
  Subscription: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  )
};

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: View.HOME, label: 'Início', icon: <Icons.Home /> },
    { id: View.STORIES, label: 'Voz', icon: <Icons.Stories /> },
    { id: View.GALLERY, label: 'Lente', icon: <Icons.Gallery /> },
    { id: View.CHAT, label: 'Íntimo', icon: <Icons.Chat /> },
    { id: View.SUBSCRIPTION, label: 'Elite', icon: <Icons.Subscription /> },
  ];

  return (
    <>
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#050505]/60 backdrop-blur-3xl border-b border-white/5 items-center justify-between px-16 h-20">
        <div className="text-xl font-cursive text-rose-600 tracking-[-0.05em] cursor-pointer hover:text-rose-500 transition-colors" onClick={() => onNavigate(View.HOME)}>
          Iasmin
        </div>
        <div className="flex gap-14">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1.5 transition-all group ${
                currentView === item.id ? 'text-rose-500' : 'text-zinc-700'
              }`}
            >
              <div className="transition-transform duration-500 group-hover:scale-110">{item.icon}</div>
              <span className="text-[7px] uppercase tracking-[0.4em] font-bold">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="w-16"></div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-2xl border-t border-white/5 px-10 py-6">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-2 transition-all ${
                currentView === item.id ? 'text-rose-500 scale-110' : 'text-zinc-800'
              }`}
            >
              {item.icon}
              <span className="text-[6px] font-bold uppercase tracking-[0.3em]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
