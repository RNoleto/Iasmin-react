
import React from 'react';
import Button from '../atoms/Button';

interface AgeGateProps {
  onVerify: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onVerify }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-transparent to-transparent opacity-50"></div>
      
      <div className="relative max-w-md w-full text-center space-y-8 bg-zinc-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif italic text-rose-500">IASmin</h1>
          <p className="text-zinc-400 text-sm tracking-widest uppercase">Exclusive Access</p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Conteúdo Restrito</h2>
          <p className="text-zinc-400 leading-relaxed">
            Este site contém material adulto destinado apenas a maiores de 18 anos. 
            Ao entrar, você confirma que possui idade legal e deseja visualizar este conteúdo.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button onClick={onVerify} className="w-full">
            Sou maior de 18 anos
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => window.location.href = 'https://google.com'}
          >
            Sair
          </Button>
        </div>
        
        <p className="text-xs text-zinc-600">
          Privacidade e Termos se aplicam. Use com responsabilidade.
        </p>
      </div>
    </div>
  );
};

export default AgeGate;
