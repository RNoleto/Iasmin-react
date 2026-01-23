
import React from 'react';
import { View } from '../../types';
import Button from '../atoms/Button';

interface HomeViewProps {
  onNavigate: (view: View) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Hero Section */}
      <section className="relative h-[75vh] md:h-[85vh] flex flex-col items-center justify-center text-center rounded-[3rem] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1519011985187-444d62641929?auto=format&fit=crop&q=80&w=1200" 
            alt="IASmin Portrait" 
            className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 space-y-8 max-w-3xl px-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500 mb-2">
            Experiência 100% Privada
          </div>
          <h1 className="text-6xl md:text-9xl font-serif italic text-white leading-[0.9]">
            Toque <br />
            <span className="text-rose-700">Invisível.</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto">
            Deixe minha voz guiar seus desejos mais profundos. Um santuário onde a imaginação não tem limites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button onClick={() => onNavigate(View.STORIES)} className="h-14 px-10">Ouvir Histórias</Button>
            <Button variant="outline" onClick={() => onNavigate(View.GALLERY)} className="h-14 px-10">Galeria Secreta</Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          { title: 'Voz Imersiva', desc: 'Narração suave em áudio 8D com sons ambiente que trazem a cena para sua realidade.', icon: '🎙️' },
          { title: 'Conexão Real', desc: 'Um chat íntimo onde respondo suas fantasias com a personalidade de IASmin.', icon: '💬' },
          { title: 'Visão Privada', desc: 'Galeria de fotos artísticas e sensuais, exclusivas para membros selecionados.', icon: '🔐' },
        ].map((feat, i) => (
          <div key={i} className="group bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm hover:border-rose-900/30 transition-all duration-500">
            <div className="text-5xl mb-6 transition-transform group-hover:scale-110 duration-500">{feat.icon}</div>
            <h3 className="text-2xl font-bold mb-3 font-serif italic text-zinc-200">{feat.title}</h3>
            <p className="text-zinc-500 leading-relaxed text-sm">{feat.desc}</p>
          </div>
        ))}
      </section>

      {/* Quote */}
      <section className="py-24 text-center px-4">
        <blockquote className="text-3xl md:text-5xl font-serif italic text-zinc-400 max-w-4xl mx-auto leading-tight">
          "O verdadeiro prazer começa no ouvido e termina exatamente onde você desejar."
        </blockquote>
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="w-12 h-[1px] bg-rose-800"></div>
          <p className="text-rose-600 font-serif text-xl">— IASmin</p>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
