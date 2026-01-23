
import React, { useState, useRef, useEffect } from 'react';
import { Story } from '../../types';
import Button from '../atoms/Button';
import { IASminChatService } from '../../services/geminiService';

const MOCK_STORIES: Story[] = [
  { id: '1', title: 'O Encontro na Chuva', excerpt: 'O som das gotas batendo no vidro era apenas o pano de fundo para o calor que subia por entre nossas mãos entrelaçadas...', duration: '12:45', coverImage: 'https://images.unsplash.com/photo-1519011985187-444d62641929?auto=format&fit=crop&q=80&w=800', isDemo: true },
  { id: '2', title: 'Segredos de Escritório', excerpt: 'A porta se fechou e, pela primeira vez, o silêncio entre nós falou mais alto que qualquer relatório corporativo.', duration: '15:20', coverImage: 'https://images.unsplash.com/photo-1522845015757-50bce044e5da?auto=format&fit=crop&q=80&w=800', isDemo: false },
  { id: '3', title: 'Uma Noite em Paris', excerpt: 'As luzes da cidade eram distantes, mas o brilho em seus olhos estava perto demais para qualquer um de nós ignorar.', duration: '18:10', coverImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=800', isDemo: false },
  { id: '4', title: 'Toque de Seda (Demo)', excerpt: 'Sinta a suavidade da minha voz enquanto descrevo o início de uma noite inesquecível, onde cada toque é uma promessa...', duration: '03:00', coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', isDemo: true },
];

// Helper functions for audio processing
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
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setPlaying(null);
  };

  const handlePlayDemo = async (story: Story) => {
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

      const audioBase64 = await chatServiceRef.current?.generateNarration(story.excerpt);
      
      if (audioBase64) {
        const audioData = decodeBase64(audioBase64);
        const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          setPlaying(null);
        };

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
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif italic text-white">Minhas Histórias</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">Narrativas envolventes para despertar seus sentidos. Ouça minha voz nas demonstrações gratuitas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_STORIES.map((story) => (
          <div key={story.id} className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 flex flex-col">
            <div className="aspect-[4/5] relative shrink-0">
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
              
              {!story.isDemo && (
                <div className="absolute top-4 right-4 bg-rose-600/90 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-sm">
                  Exclusivo
                </div>
              )}
              
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">{story.duration}</p>
                <h3 className="text-lg font-bold text-white leading-tight">{story.title}</h3>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-zinc-500 line-clamp-2 italic">"{story.excerpt}"</p>
              {story.isDemo ? (
                <Button 
                  variant={playing === story.id ? 'secondary' : 'primary'} 
                  className={`w-full text-xs h-10 ${isLoading === story.id ? 'animate-pulse' : ''}`}
                  onClick={() => handlePlayDemo(story)}
                  disabled={isLoading !== null && isLoading !== story.id}
                >
                  {isLoading === story.id ? 'Gerando voz...' : playing === story.id ? '⏹️ Parar' : '▶️ Ouvir Minha Voz'}
                </Button>
              ) : (
                <Button variant="outline" className="w-full text-xs h-10">Assinar para Ouvir</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {playing && (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-80 bg-zinc-900/90 backdrop-blur-2xl border border-rose-500/30 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-rose-600/20">
              <span className="text-lg">🎙️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">IASmin Narrando</p>
              <p className="text-white text-sm font-medium truncate">{MOCK_STORIES.find(s => s.id === playing)?.title}</p>
            </div>
            <button onClick={stopAudio} className="text-white/40 hover:text-white transition-colors p-2">✕</button>
          </div>
          <div className="mt-4 flex items-center gap-2">
             <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-rose-600 w-full origin-left animate-[progress_15s_linear_infinite]"></div>
             </div>
             <span className="text-[9px] text-zinc-500 font-mono">LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesView;
