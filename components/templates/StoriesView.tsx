
import React, { useState, useRef, useEffect } from 'react';
import { Story, View, SubscriptionLevel } from '../../types';
import Button from '../atoms/Button';
import { IASminChatService } from '../../services/geminiService';

interface ExtendedStory extends Story {
  ambientHint: string;
  unsplashId: string;
  isPremium: boolean;
}

interface StoriesViewProps {
  subLevel: SubscriptionLevel;
  onNavigate: (view: View) => void;
}

const BASE_STORIES: ExtendedStory[] = [
  { 
    id: '1', 
    title: 'Sussurro de Brasília', 
    excerpt: 'Onde o concreto encontra a suavidade da minha voz sob o céu estrelado... *suspiro*', 
    duration: '06:15', 
    coverImage: '', 
    isDemo: true,
    isPremium: false,
    ambientHint: 'vento leve na esplanada, silêncio da noite',
    unsplashId: "photo-1515886657613-9f3515b0c78f"
  },
  { 
    id: '2', 
    title: 'Vinho & Pecado', 
    excerpt: 'A temperatura sobe enquanto a taça esvazia e nossos segredos transbordam... *beijo*', 
    duration: '12:40', 
    coverImage: '', 
    isDemo: false,
    isPremium: true,
    ambientHint: 'chuva batendo suave no vidro, jazz baixo',
    unsplashId: "photo-1503104834685-7205e8607eb9"
  },
  { 
    id: '3', 
    title: 'Pele no Lençol', 
    excerpt: 'Sinta o atrito da seda e a proximidade da minha respiração no seu ouvido... *gemido leve*', 
    duration: '09:22', 
    coverImage: '', 
    isDemo: false,
    isPremium: true,
    ambientHint: 'música low-fi sensual, lençóis se movendo',
    unsplashId: "photo-1494790108377-be9c29b29330"
  },
  { 
    id: '4', 
    title: 'Ensaio Proibido', 
    excerpt: 'Desta vez, a câmera é apenas um pretexto para o que realmente queremos... *risos*', 
    duration: '14:55', 
    coverImage: '', 
    isDemo: false,
    isPremium: true,
    ambientHint: 'cliques de câmera distantes, estúdio minimalista',
    unsplashId: "photo-1488426862026-3ee34a7d66df"
  },
];

const StoriesView: React.FC<StoriesViewProps> = ({ subLevel, onNavigate }) => {
  const [stories, setStories] = useState<ExtendedStory[]>(BASE_STORIES);
  const [playing, setPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [generatingImages, setGeneratingImages] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const chatServiceRef = useRef<IASminChatService | null>(null);
  const audioCacheRef = useRef<Map<string, AudioBuffer>>(new Map());

  useEffect(() => {
    chatServiceRef.current = new IASminChatService();
    
    const loadCovers = async () => {
      const updatedStories = [...BASE_STORIES];
      for (let i = 0; i < updatedStories.length; i++) {
        const img = await chatServiceRef.current!.generateImage(`id:${updatedStories[i].unsplashId}`, "3:4");
        if (img) updatedStories[i].coverImage = img;
      }
      setStories(updatedStories);
      setGeneratingImages(false);
    };

    loadCovers();
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setPlaying(null);
  };

  const handlePlayDemo = async (story: ExtendedStory) => {
    if (story.isPremium && subLevel === SubscriptionLevel.FREE) {
      onNavigate(View.SUBSCRIPTION);
      return;
    }

    if (playing === story.id) { stopAudio(); return; }
    stopAudio();
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioCacheRef.current.has(story.id)) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioCacheRef.current.get(story.id)!;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPlaying(null);
      sourceNodeRef.current = source;
      source.start(0);
      setPlaying(story.id);
      return;
    }
    setIsLoading(story.id);
    try {
      const audioBase64 = await chatServiceRef.current?.generateNarration(story.excerpt, story.ambientHint);
      if (audioBase64) {
        const audioData = atob(audioBase64);
        const bytes = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) bytes[i] = audioData.charCodeAt(i);
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        audioCacheRef.current.set(story.id, buffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setPlaying(null);
        sourceNodeRef.current = source;
        source.start(0);
        setPlaying(story.id);
      }
    } catch (e) {
      console.error(e);
    } finally { setIsLoading(null); }
  };

  return (
    <div className="space-y-24 pb-32 animate-in fade-in duration-1000 relative">
      <div className="text-center space-y-6">
        <h2 className="text-7xl font-serif italic text-white tracking-tighter neon-text-rose">Narrativas Ocultas</h2>
        <div className="flex items-center justify-center gap-4">
           <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-rose-900 shadow-[0_0_5px_rgba(225,29,72,0.5)]"></div>
           <p className="text-rose-600 text-[11px] uppercase tracking-[0.6em] font-bold">Conteúdo Elite</p>
           <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-rose-900 shadow-[0_0_5px_rgba(225,29,72,0.5)]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6">
        {stories.map((story) => (
          <div key={story.id} className="group bg-[#030303] rounded-[3.5rem] overflow-hidden border border-white/5 flex flex-col hover:border-rose-900/30 transition-all duration-700 hover:shadow-[0_0_40px_rgba(225,29,72,0.05)] relative">
            <div className="aspect-[4/5] relative overflow-hidden bg-zinc-950">
              {generatingImages && !story.coverImage ? (
                <div className="w-full h-full animate-pulse bg-zinc-950 flex items-center justify-center text-[9px] text-zinc-800 uppercase tracking-widest italic">Acessando...</div>
              ) : (
                <img src={story.coverImage} className={`w-full h-full object-cover grayscale-[0.6] opacity-30 group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-1000 scale-105 group-hover:scale-100 ${story.isPremium && subLevel === SubscriptionLevel.FREE ? 'blur-md opacity-20' : ''}`} />
              )}
              
              {story.isPremium && subLevel === SubscriptionLevel.FREE && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-900/40 flex items-center justify-center text-rose-500 neon-border-rose">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent"></div>
              
              {playing === story.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-rose-950/20 backdrop-blur-sm">
                   <div className="flex gap-1.5 items-end h-10">
                      <div className="w-1.5 bg-rose-600 animate-[bars_0.6s_infinite] shadow-[0_0_10px_rgba(225,29,72,0.8)]"></div>
                      <div className="w-1.5 bg-rose-600 animate-[bars_0.6s_infinite_0.1s] shadow-[0_0_10px_rgba(225,29,72,0.8)]"></div>
                      <div className="w-1.5 bg-rose-600 animate-[bars_0.6s_infinite_0.2s] shadow-[0_0_10px_rgba(225,29,72,0.8)]"></div>
                   </div>
                </div>
              )}

              <div className="absolute bottom-10 left-10 right-10">
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-[0.4em] mb-3 neon-text-rose">{story.duration}</p>
                <h3 className="text-4xl font-serif italic text-white leading-tight tracking-tight">{story.title}</h3>
              </div>
            </div>
            <div className="p-12 pt-0 flex-1 flex flex-col justify-between space-y-10">
              <p className="text-[13px] text-zinc-500 italic font-light leading-relaxed line-clamp-3">
                {story.isPremium && subLevel === SubscriptionLevel.FREE ? "Esse segredo é guardado para membros do Círculo Íntimo..." : `"${story.excerpt.replace(/\*.*?\*/g, '')}"`}
              </p>
              <button 
                onClick={() => handlePlayDemo(story)}
                disabled={generatingImages}
                className={`w-full h-16 rounded-full text-[11px] font-bold uppercase tracking-[0.4em] transition-all border flex items-center justify-center gap-4 ${
                  playing === story.id 
                  ? 'bg-rose-900 border-rose-800 text-white neon-border-rose' 
                  : 'bg-transparent border-white/10 text-zinc-500 hover:border-rose-900/40 hover:text-rose-500'
                }`}
              >
                {isLoading === story.id ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : playing === story.id ? (
                  <>Parar</>
                ) : story.isPremium && subLevel === SubscriptionLevel.FREE ? (
                  <>Liberar Acesso</>
                ) : (
                  <>Ouvir Agora</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes bars { 0%, 100% { height: 10px; } 50% { height: 25px; } }
      `}</style>
    </div>
  );
};

export default StoriesView;
