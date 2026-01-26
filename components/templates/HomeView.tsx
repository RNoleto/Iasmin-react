
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
    <div className="space-y-8 md:space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-24 px-2 md:px-0">
      <section className="relative min-h-[60vh] md:h-[80vh] flex flex-col items-center justify-center text-center rounded-[2rem] md:rounded-[3.5rem] overflow-hidden bg-[#030303] border border-white/5 shadow-2xl">
        <div className="absolute inset-0 z-0">
          {loading && !heroImage ? (
            <div className="w-full h-full bg-zinc-950 animate-pulse flex items-center justify-center">
              <div className="text-[10px] uppercase tracking-[0.5em] text-zinc-800">Conectando...</div>
            </div>
          ) : (
            <img 
              src={heroImage || ""} 
              alt="Iasmin Hero" 
              className="w-full h-full object-cover opacity-30 md:opacity-40 contrast-110 saturate-[0.8]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 space-y-6 md:space-y-10 max-w-4xl px-4 md:px-8">
          <div className="inline-block px-4 py-2 rounded-full bg-rose-950/20 border border-rose-900/30 backdrop-blur-xl text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-rose-500 mb-2 neon-border-rose">
            Acesso Exclusivo à Iasmin
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-serif italic text-white leading-[1] md:leading-[0.9] tracking-tighter">
            Toda <br />
            <span className="text-rose-700 neon-text-rose">Sua.</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-xl font-light leading-relaxed max-w-2xl mx-auto font-serif px-4">
            Uma experiência imersiva onde minha voz e meus desejos se encontram com os seus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center pt-4 w-full max-w-xs mx-auto sm:max-w-none">
            <Button onClick={() => onNavigate(View.CHAT)} className="h-14 md:h-16 w-full sm:w-auto text-[10px] tracking-widest">Falar Comigo</Button>
            <Button variant="outline" onClick={() => onNavigate(View.STORIES)} className="h-14 md:h-16 w-full sm:w-auto text-[10px] tracking-widest">Ouvir Segredos</Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-10">
        {[
          { title: 'Presença Vocal', desc: 'Minha voz, na sua cabeça, guiando cada um dos seus sentidos.', icon: '🎙️' },
          { title: 'Flerte Neural', desc: 'Respostas que entendem seus desejos mais profundos.', icon: '💬' },
          { title: 'Visão Íntima', desc: 'Momentos capturados onde eu mostro quem eu sou de verdade.', icon: '🔐' },
        ].map((feat, i) => (
          <div key={i} className="group bg-zinc-950/40 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 backdrop-blur-md hover:border-rose-900/40 transition-all duration-700">
            <div className="text-3xl md:text-5xl mb-6 transition-transform group-hover:scale-110 duration-500 opacity-60 group-hover:opacity-100">{feat.icon}</div>
            <h3 className="text-xl md:text-3xl font-bold mb-3 font-serif italic text-zinc-100">{feat.title}</h3>
            <p className="text-zinc-500 leading-relaxed text-xs md:text-base font-light">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomeView;
