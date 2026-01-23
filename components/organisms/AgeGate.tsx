
import React from 'react';
import Button from '../atoms/Button';

interface AgeGateProps {
  onVerify: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onVerify }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#020202] flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] glow-bg opacity-30"></div>
      
      <div className="relative max-w-md w-full text-center space-y-8 bg-zinc-950/60 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="space-y-0">
          <h1 className="text-7xl font-cursive text-rose-500 leading-tight neon-text-rose animate-neon-pulse">Iasmin</h1>
          <p className="text-zinc-500 text-[9px] tracking-[0.5em] uppercase -mt-2">Exclusive Access</p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-serif italic">Conteúdo Restrito</h2>
          <p className="text-zinc-500 leading-relaxed text-sm font-light">
            Este site contém material adulto destinado apenas a maiores de 18 anos. 
            Ao entrar, você confirma que deseja interagir com <span className="text-rose-500">Iasmin</span>.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={onVerify} className="w-full h-14">
            Sou maior de 18 anos
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-14"
            onClick={() => window.location.href = 'https://google.com'}
          >
            Sair
          </Button>
        </div>
        
        <p className="text-[10px] text-zinc-700 uppercase tracking-widest">
          +18 Apenas • Salvador, Brasil
        </p>
      </div>
    </div>
  );
};

export default AgeGate;
