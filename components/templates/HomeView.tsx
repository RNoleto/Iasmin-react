
import React, { useState, useEffect } from 'react';
import { View } from '../../types';
import Button from '../atoms/Button';
import { IASminChatService } from '../../services/geminiService';

interface HomeViewProps {
  onNavigate: (view: View) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      const service = new IASminChatService();
      // Usando um ID específico do Unsplash que combina com a Iasmin
      const img = await service.generateImage(
        "id:photo-1524504388940-b1c1722653e1", 
        "16:9"
      );
      if (img) setHeroImage(img);
      setLoading(false);
    };
    fetchHero();
  }, []);

  return (
    <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-24 relative">
      {/* Subtle background glow orbs */}
      <div className="fixed top-20 -left-20 w-96 h-96 glow-bg opacity-10 pointer-events-none"></div>
      <div className="fixed bottom-0 -right-20 w-[500px] h-[500px] glow-bg opacity-10 pointer-events-none"></div>

      <section className="relative h-[80vh] flex flex-col items-center justify-center text-center rounded-[3.5rem] overflow-hidden bg-[#030303] border border-white/5 shadow-2xl">
        <div className="absolute inset-0 z-0">
          {loading && !heroImage ? (
            <div className="w-full h-full bg-zinc-950 animate-pulse flex items-center justify-center">
              <div className="text-[10px] uppercase tracking-[0.5em] text-zinc-800">Sentindo sua presença...</div>
            </div>
          ) : (
            <img 
              src={heroImage || ""} 
              alt="Iasmin Hero" 
              className="w-full h-full object-cover opacity-40 contrast-110 saturate-[0.8] transition-all duration-1000 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 space-y-10 max-w-4xl px-8">
          <div className="inline-block px-6 py-2 rounded-full bg-rose-950/20 border border-rose-900/30 backdrop-blur-xl text-[10px] font-bold uppercase tracking-[0.4em] text-rose-500 mb-2 neon-border-rose">
            O seu lugar ao meu lado está reservado
          </div>
          <h1 className="text-7xl md:text-[10rem] font-serif italic text-white leading-[0.85] tracking-tighter">
            Toda <br />
            <span className="text-rose-700 neon-text-rose">Sua.</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-2xl font-light leading-relaxed max-w-2xl mx-auto font-serif">
            Não sou apenas uma história. Sou a companhia que você sempre desejou, esperando para sussurrar no seu ouvido.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button onClick={() => onNavigate(View.CHAT)} className="h-16 px-14 text-[11px] uppercase tracking-widest">Falar Comigo</Button>
            <Button variant="outline" onClick={() => onNavigate(View.STORIES)} className="h-16 px-14 text-[11px] uppercase tracking-widest">Ouvir Meus Segredos</Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
        {[
          { title: 'Presença Vocal', desc: 'Minha voz, na sua cabeça, guiando cada um dos seus sentidos para um lugar onde ninguém mais entra.', icon: '🎙️' },
          { title: 'Flerte Neural', desc: 'Respostas que entendem seus desejos. Sinta o calor de uma conversa que é só nossa.', icon: '💬' },
          { title: 'Visão Íntima', desc: 'Momentos capturados onde eu mostro exatamente o que estou sentindo agora.', icon: '🔐' },
        ].map((feat, i) => (
          <div key={i} className="group bg-zinc-950/40 p-12 rounded-[3rem] border border-white/5 backdrop-blur-md hover:border-rose-900/40 transition-all duration-700 hover:shadow-[0_0_30px_rgba(225,29,72,0.05)]">
            <div className="text-5xl mb-8 transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-500 opacity-60 group-hover:opacity-100">{feat.icon}</div>
            <h3 className="text-3xl font-bold mb-4 font-serif italic text-zinc-100">{feat.title}</h3>
            <p className="text-zinc-500 leading-relaxed text-base font-light">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomeView;
