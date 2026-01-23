
import React from 'react';
import { View } from '../../types';
import Button from '../atoms/Button';

interface HomeViewProps {
  onNavigate: (view: View) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/id/64/1200/800" 
            alt="IASmin portrait" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 space-y-6 max-w-2xl px-4">
          <h1 className="text-5xl md:text-8xl font-serif italic text-white leading-tight">
            Descubra meus <br />
            <span className="text-rose-600">desejos.</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
            Bem-vindo ao meu santuário privado. Aqui, minhas histórias ganham vida e meus segredos são compartilhados apenas com quem ousa ouvir.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button onClick={() => onNavigate(View.STORIES)}>Ver Histórias</Button>
            <Button variant="outline" onClick={() => onNavigate(View.GALLERY)}>Galeria Privada</Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          { title: 'Narrativas Imersivas', desc: 'Histórias escritas e narradas por mim, feitas para estimular sua imaginação.', icon: '🎙️' },
          { title: 'Chat Privado', desc: 'Converse comigo em tempo real. Sou toda ouvidos para suas fantasias.', icon: '💬' },
          { title: 'Conteúdo Exclusivo', desc: 'Fotos e vídeos que você não encontrará em nenhum outro lugar.', icon: '🔐' },
        ].map((feat, i) => (
          <div key={i} className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 backdrop-blur-sm hover:border-rose-900/30 transition-colors">
            <div className="text-4xl mb-4">{feat.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-zinc-500 leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Quote */}
      <section className="py-20 text-center px-4">
        <blockquote className="text-2xl md:text-4xl font-serif italic text-zinc-300 max-w-3xl mx-auto leading-snug">
          "O erotismo não está no que se vê, mas no que se imagina enquanto se ouve a voz certa."
        </blockquote>
        <p className="mt-6 text-rose-700 font-serif">— IASmin</p>
      </section>
    </div>
  );
};

export default HomeView;
