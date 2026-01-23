
import React, { useState, useRef, useEffect } from 'react';
import { Story } from '../../types';
import Button from '../atoms/Button';
import { IASminChatService } from '../../services/geminiService';

interface ExtendedStory extends Story {
  ambientHint: string;
}

const MOCK_STORIES: ExtendedStory[] = [
  { 
    id: '1', 
    title: 'O Encontro na Chuva', 
    excerpt: 'O som das gotas batendo no vidro era apenas o pano de fundo para o calor que subia por entre nossas mãos entrelaçadas...', 
    duration: '12:45', 
    coverImage: 'https://images.unsplash.com/photo-1519011985187-444d62641929?auto=format&fit=crop&q=80&w=800', 
    isDemo: true,
    ambientHint: 'som de chuva forte batendo na janela, trovões abafados e música jazz melancólica'
  },
  { 
    id: '2', 
    title: 'Segredos de Escritório', 
    excerpt: 'A porta se fechou e, pela primeira vez, o silêncio entre nós falou mais alto que qualquer relatório corporativo.', 
    duration: '15:20', 
    coverImage: 'https://images.unsplash.com/photo-1522845015757-50bce044e5da?auto=format&fit=crop&q=80&w=800', 
    isDemo: false,
    ambientHint: 'silêncio absoluto, som de respiração próxima e o clique metálico de uma chave girando'
  },
  { 
    id: '3', 
    title: 'Toque de Seda (Demo)', 
    excerpt: 'Sinta a suavidade da minha voz enquanto descrevo o início de uma noite inesquecível, onde cada toque é uma promessa...', 
    duration: '03:00', 
    coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', 
    isDemo: true,
    ambientHint: 'música lo-fi sensual, som de lençóis de seda se movendo e sussurros ao pé do ouvido'
  },
  { 
    id: '4', 
    title: 'Champa & Morangos', 
    excerpt: 'O borbulhar da taça era o único som que ousava interromper a intensidade do nosso olhar.', 
    duration: '09:30', 
    coverImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800', 
    isDemo: false,
    ambientHint: 'som de champanhe sendo servido, cristais se tocando e risadas suaves ao fundo'
  },
];

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const StoriesView: React.FC = () => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const chatServiceRef = useRef<IASminChatService | null>(null);

  useEffect(() => {
    chatServiceRef.current = new IASminChatService();
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
    if (playing === story.id) {
      stopAudio();
      return;
    }

    stopAudio();
    setIsLoading(story.id);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBase64 = await chatServiceRef.current?.generateNarration(story.excerpt, story.ambientHint);
      
      if (audioBase64) {
        const audioData = decodeBase64(audioBase64);
        const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => setPlaying(null);

        sourceNodeRef.current = source;
        source.start(0);
        setPlaying(story.id);
      }
    } catch (error) {
      console.error("Playback error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-12 pb-32 md:pb-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif italic text-white">Minhas Histórias</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">Experiências sonoras imersivas com minha voz exclusiva e ambientação cinematográfica.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {MOCK_STORIES.map((story) => (
          <div key={story.id} className="group relative bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col hover:border-rose-500/30 transition-all duration-500">
            <div className="aspect-[4/5] relative shrink-0">
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              
              {!story.isDemo && (
                <div className="absolute top-4 right-4 bg-rose-600/90 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-sm shadow-xl">
                  VIP
                </div>
              )}

              {story.isDemo && (
                <div className="absolute top-4 left-4 bg-white/10 text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                  Experiência Ativa
                </div>
              )}
              
              <div className="absolute bottom-4 left-6 right-6 space-y-1">
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">{story.duration}</p>
                <h3 className="text-xl font-bold text-white leading-tight font-serif italic">{story.title}</h3>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-zinc-500 line-clamp-3 italic leading-relaxed">"{story.excerpt}"</p>
              {story.isDemo ? (
                <Button 
                  variant={playing === story.id ? 'secondary' : 'primary'} 
                  className={`w-full text-[10px] h-11 tracking-widest uppercase transition-all duration-500 ${isLoading === story.id ? 'animate-pulse' : ''}`}
                  onClick={() => handlePlayDemo(story)}
                  disabled={isLoading !== null && isLoading !== story.id}
                >
                  {isLoading === story.id ? 'Preparando...' : playing === story.id ? '⏹️ Parar' : '▶️ Ouvir Demo'}
                </Button>
              ) : (
                <Button variant="outline" className="w-full text-[10px] h-11 tracking-widest uppercase">Assinar VIP</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {playing && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-10 md:right-10 md:left-auto md:w-[400px] z-[60] animate-in slide-in-from-bottom-10 duration-500">
          <div className="relative bg-zinc-950/80 backdrop-blur-[40px] border border-rose-500/20 p-7 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden group">
            
            {/* Animated Glow Background */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-600/10 blur-[80px] rounded-full group-hover:bg-rose-600/20 transition-all duration-1000"></div>
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="relative shrink-0">
                <div className="w-16 h-16 bg-gradient-to-tr from-rose-600 to-rose-900 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-900/40 relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <span className="text-3xl animate-pulse">💋</span>
                </div>
                <div className="absolute inset-0 bg-rose-600 rounded-2xl animate-ping opacity-20"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-rose-400 font-black uppercase tracking-[0.2em]">Sessão Imersiva</p>
                </div>
                <p className="text-white text-xl font-serif italic truncate pr-2">
                  {MOCK_STORIES.find(s => s.id === playing)?.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest">Ambiência Ativa</span>
                   <div className="flex gap-0.5 items-center">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-0.5 h-2 bg-rose-500/40 rounded-full"></div>
                      ))}
                   </div>
                </div>
              </div>
              
              <button 
                onClick={stopAudio} 
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-rose-600 hover:text-white text-zinc-500 transition-all flex items-center justify-center border border-white/5"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-3 relative z-10">
               <div className="flex justify-between items-end">
                  <span className="text-[9px] text-rose-500/80 font-bold tracking-[0.3em] uppercase">IASmin Narrando</span>
                  <div className="flex gap-1">
                     {[...Array(15)].map((_, i) => (
                       <div 
                         key={i} 
                         className="w-0.5 h-3 bg-rose-500 rounded-full animate-[soundbar_1s_ease-in-out_infinite]"
                         style={{ 
                           animationDelay: `${i * 0.07}s`, 
                           height: `${Math.random() * 12 + 4}px` 
                         }}
                       ></div>
                     ))}
                  </div>
               </div>
               
               <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-800 via-rose-500 to-rose-800 w-full origin-left animate-[progress_30s_linear_infinite]"></div>
               </div>
               
               <div className="flex justify-between text-[9px] text-zinc-600 font-mono tracking-widest">
                  <span>00:00</span>
                  <span className="animate-pulse">LIVE AUDIO</span>
                  <span>{MOCK_STORIES.find(s => s.id === playing)?.duration}</span>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes soundbar {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(2.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default StoriesView;
