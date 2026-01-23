
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
    title: 'Noite Estelar', 
    excerpt: 'O céu de Brasília nunca pareceu tão infinito quanto sob o calor da sua pele... *suspiro*', 
    duration: '08:12', 
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800', 
    isDemo: true,
    ambientHint: 'vento suave, grilos ao fundo e música lofi etérea'
  },
  { 
    id: '2', 
    title: 'Vinho & Confissões', 
    excerpt: 'Uma taça, dois segredos e o som da chuva lá fora... *beijo*', 
    duration: '11:45', 
    coverImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=800', 
    isDemo: false,
    ambientHint: 'som de chuva no vidro, vinho sendo servido e jazz suave'
  },
  { 
    id: '3', 
    title: 'Toque de Seda', 
    excerpt: 'Sinta cada palavra como se fosse um carinho real... *risos*', 
    duration: '04:20', 
    coverImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800', 
    isDemo: true,
    ambientHint: 'música sensual de sintetizador, respiração próxima'
  },
  { 
    id: '4', 
    title: 'O Ensaio', 
    excerpt: 'O clique da câmera era o único que ousava nos observar naquela tarde... *suspiro*', 
    duration: '15:00', 
    coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', 
    isDemo: false,
    ambientHint: 'cliques de câmera distantes, silêncio imersivo'
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

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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
  const audioCacheRef = useRef<Map<string, AudioBuffer>>(new Map());

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
    if (playing === story.id) { stopAudio(); return; }
    stopAudio();
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
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
        const buffer = await decodeAudioData(decodeBase64(audioBase64), audioContextRef.current, 24000, 1);
        audioCacheRef.current.set(story.id, buffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setPlaying(null);
        sourceNodeRef.current = source;
        source.start(0);
        setPlaying(story.id);
      }
    } finally { setIsLoading(null); }
  };

  return (
    <div className="space-y-16 pb-32 animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-serif italic text-white tracking-tight">Experiências Vocais</h2>
        <div className="w-12 h-px bg-rose-900 mx-auto"></div>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto uppercase tracking-[0.2em] font-bold">Narração imersiva com áudio neural</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        {MOCK_STORIES.map((story) => (
          <div key={story.id} className="group bg-zinc-900/50 rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col hover:border-rose-800/30 transition-all duration-700">
            <div className="aspect-[3/4] relative overflow-hidden">
              <img src={story.coverImage} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mb-1">{story.duration}</p>
                <h3 className="text-2xl font-serif italic text-white">{story.title}</h3>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
              <p className="text-xs text-zinc-500 italic leading-relaxed line-clamp-2">"{story.excerpt.replace(/\*.*?\*/g, '')}"</p>
              {story.isDemo ? (
                <Button variant={playing === story.id ? 'secondary' : 'primary'} className="w-full text-[10px] tracking-[0.3em] uppercase h-12" onClick={() => handlePlayDemo(story)}>
                  {isLoading === story.id ? 'Carregando...' : playing === story.id ? 'Parar' : 'Ouvir'}
                </Button>
              ) : (
                <Button variant="outline" className="w-full text-[10px] tracking-[0.3em] uppercase h-12 opacity-50">Desbloquear VIP</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesView;
