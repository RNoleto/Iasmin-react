
import React from 'react';
import { View } from '../../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Icons = {
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Stories: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ),
  Gallery: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  ),
  Chat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Subscription: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>
  )
};

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: View.HOME, label: 'Início', icon: <Icons.Home /> },
    { id: View.STORIES, label: 'Histórias', icon: <Icons.Stories /> },
    { id: View.GALLERY, label: 'Galeria', icon: <Icons.Gallery /> },
    { id: View.CHAT, label: 'Chat', icon: <Icons.Chat /> },
    { id: View.SUBSCRIPTION, label: 'Planos', icon: <Icons.Subscription /> },
  ];

  return (
    <>
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5 items-center justify-between px-10 h-16">
        <div className="text-3xl font-cursive text-rose-600 cursor-pointer" onClick={() => onNavigate(View.HOME)}>
          Iasmin
        </div>
        <div className="flex gap-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold transition-all hover:text-rose-500 ${
                currentView === item.id ? 'text-rose-500' : 'text-zinc-500'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
        <div className="w-24"></div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 px-6 py-4">
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
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
