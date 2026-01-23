
import React from 'react';
import { View } from '../../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: View.HOME, label: 'Início', icon: '🏠' },
    { id: View.STORIES, label: 'Histórias', icon: '📖' },
    { id: View.GALLERY, label: 'Galeria', icon: '📸' },
    { id: View.CHAT, label: 'Chat', icon: '💬' },
    { id: View.SUBSCRIPTION, label: 'Planos', icon: '💎' },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5 items-center justify-between px-10 h-16">
        <div className="text-2xl font-serif text-rose-600 cursor-pointer" onClick={() => onNavigate(View.HOME)}>
          IASmin
        </div>
        <div className="flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`text-sm font-medium transition-colors hover:text-rose-500 ${
                currentView === item.id ? 'text-rose-500' : 'text-zinc-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="w-24"></div> {/* Spacer */}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 px-4 py-3">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 min-w-[60px]"
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] font-medium tracking-tight ${
                currentView === item.id ? 'text-rose-500' : 'text-zinc-500'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
