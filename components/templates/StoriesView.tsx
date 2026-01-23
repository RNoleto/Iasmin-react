
import React, { useState } from 'react';
import { Story } from '../../types';
import Button from '../atoms/Button';

const MOCK_STORIES: Story[] = [
  { id: '1', title: 'O Encontro na Chuva', excerpt: 'O som das gotas batendo no vidro era apenas o pano de fundo para o calor que subia...', duration: '12:45', coverImage: 'https://picsum.photos/id/103/400/500', isDemo: true },
  { id: '2', title: 'Segredos de Escritório', excerpt: 'A porta se fechou e, pela primeira vez, o silêncio entre nós falou mais alto que qualquer relatório.', duration: '15:20', coverImage: 'https://picsum.photos/id/160/400/500', isDemo: false },
  { id: '3', title: 'Uma Noite em Paris', excerpt: 'As luzes da cidade eram distantes, mas o brilho em seus olhos estava perto demais para ignorar.', duration: '18:10', coverImage: 'https://picsum.photos/id/201/400/500', isDemo: false },
  { id: '4', title: 'Toque de Seda (Demo)', excerpt: 'Sinta a suavidade da minha voz enquanto descrevo o início de uma noite inesquecível...', duration: '03:00', coverImage: 'https://picsum.photos/id/202/400/500', isDemo: true },
];

const StoriesView: React.FC = () => {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif italic text-white">Minhas Histórias</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">Narrativas envolventes para despertar seus sentidos. Ouça as demonstrações gratuitas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_STORIES.map((story) => (
          <div key={story.id} className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5">
            <div className="aspect-[4/5] relative">
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
              
              {!story.isDemo && (
                <div className="absolute top-4 right-4 bg-rose-600/90 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-sm">
                  Exclusivo
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <p className="text-xs text-rose-500 font-medium">{story.duration}</p>
                <h3 className="text-xl font-bold text-white leading-tight">{story.title}</h3>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-sm text-zinc-500 line-clamp-2">{story.excerpt}</p>
              {story.isDemo ? (
                <Button 
                  variant={playing === story.id ? 'secondary' : 'primary'} 
                  className="w-full text-sm"
                  onClick={() => setPlaying(playing === story.id ? null : story.id)}
                >
                  {playing === story.id ? '⏹️ Parar Demo' : '▶️ Ouvir Demo'}
                </Button>
              ) : (
                <Button variant="outline" className="w-full text-sm">Assinar para Ouvir</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {playing && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-80 bg-rose-950/90 backdrop-blur-xl border border-rose-500/30 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-600 rounded-lg flex items-center justify-center animate-pulse">
              🎵
            </div>
            <div className="flex-1">
              <p className="text-xs text-rose-300 font-bold uppercase">Tocando Agora</p>
              <p className="text-white font-medium truncate">Demo: {MOCK_STORIES.find(s => s.id === playing)?.title}</p>
            </div>
            <button onClick={() => setPlaying(null)} className="text-white/60 hover:text-white">✕</button>
          </div>
          <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-rose-500 w-1/3 animate-[progress_10s_linear_infinite]"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesView;
