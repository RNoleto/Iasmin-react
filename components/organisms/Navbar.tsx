
import React from 'react';
import { View } from '../../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Icons = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
  ),
  Stories: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
  ),
  Gallery: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="1"/><path d="M4 12h16"/></svg>
  ),
  Chat: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/><path d="M12 12h.01"/></svg>
  ),
  Subscription: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
  )
};

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: View.HOME, label: 'Home', icon: <Icons.Home /> },
    { id: View.STORIES, label: 'Histórias', icon: <Icons.Stories /> },
    { id: View.GALLERY, label: 'Galeria', icon: <Icons.Gallery /> },
    { id: View.CHAT, label: 'Chat', icon: <Icons.Chat /> },
    { id: View.SUBSCRIPTION, label: 'VIP', icon: <Icons.Subscription /> },
  ];

  return (
    <>
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 items-center justify-between px-12 h-20">
        <div className="text-2xl font-cursive text-rose-600 tracking-tighter cursor-pointer" onClick={() => onNavigate(View.HOME)}>
          Iasmin
        </div>
        <div className="flex gap-12">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 transition-all hover:text-rose-500 group ${
                currentView === item.id ? 'text-rose-500' : 'text-zinc-600'
              }`}
            >
              <div className="mb-1 transition-transform group-hover:scale-110">{item.icon}</div>
              <span className="text-[8px] uppercase tracking-[0.3em] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="w-20"></div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-2xl border-t border-white/5 px-8 py-5">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                currentView === item.id ? 'text-rose-500 scale-110' : 'text-zinc-600'
              }`}
            >
              {item.icon}
              <span className="text-[7px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
