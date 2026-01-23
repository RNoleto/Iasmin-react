
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
    title: 'Sussurro de Brasília', 
    excerpt: 'Onde o concreto encontra a suavidade da minha voz sob o céu estrelado... *suspiro*', 
    duration: '06:15', 
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800', 
    isDemo: true,
    ambientHint: 'vento leve, grilos distantes e uma melodia de piano abafada'
  },
  { 
    id: '2', 
    title: 'Vinho & Pecado', 
    excerpt: 'A temperatura sobe enquanto a taça esvazia e nossos segredos transbordam... *beijo*', 
    duration: '12:40', 
    coverImage: 'https://images.unsplash.com/photo-1519011985187-444d62641929?auto=format&fit=crop&q=80&w=800', 
    isDemo: false,
    ambientHint: 'som de chuva calma no vidro, jazzy vibes'
  },
  { 
    id: '3', 
    title: 'Pele no Lençol', 
    excerpt: 'Sinta o atrito da seda e a proximidade da minha respiração no seu ouvido... *gemido leve*', 
    duration: '09:22', 
    coverImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800', 
    isDemo: true,
    ambientHint: 'música sensual low-tempo, respiração humana audível'
  },
  { 
    id: '4', 
    title: 'Ensaio Proibido', 
    excerpt: 'Desta vez, a câmera é apenas um pretexto para o que realmente queremos... *risos*', 
    duration: '14:55', 
    coverImage: 'https://images.unsplash.com/photo-1529139513466-470460969242?auto=format&fit=crop&q=80&w=800', 
    isDemo: false,
    ambientHint: 'ambiente de estúdio silencioso, cliques sutis ao fundo'
  },
];

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
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
    <div className="space-y-20 pb-32 animate-in fade-in duration-1000">
      <div className="text-center space-y-6">
        <h2 className="text-6xl font-serif italic text-white tracking-tighter">Narrativas Ocultas</h2>
        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.5em] font-bold">Imersão neural em alta fidelidade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 px-6">
        {MOCK_STORIES.map((story) => (
          <div key={story.id} className="group bg-[#080808] rounded-[3rem] overflow-hidden border border-white/5 flex flex-col hover:border-rose-900/30 transition-all duration-700">
            <div className="aspect-[4/5] relative overflow-hidden">
              <img src={story.coverImage} className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-1000 scale-105 group-hover:scale-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-[9px] text-rose-500 font-bold uppercase tracking-[0.3em] mb-2">{story.duration}</p>
                <h3 className="text-3xl font-serif italic text-white">{story.title}</h3>
              </div>
            </div>
            <div className="p-10 pt-0 flex-1 flex flex-col justify-between space-y-8">
              <p className="text-[11px] text-zinc-500 italic leading-relaxed line-clamp-3">
                "{story.excerpt.replace(/\*.*?\*/g, '')}"
              </p>
              {story.isDemo ? (
                <button 
                  onClick={() => handlePlayDemo(story)}
                  className={`w-full py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] transition-all border ${
                    playing === story.id 
                    ? 'bg-rose-900 border-rose-800 text-white' 
                    : 'bg-transparent border-white/10 text-zinc-400 hover:border-rose-800 hover:text-rose-500'
                  }`}
                >
                  {isLoading === story.id ? 'Ajustando Frequência...' : playing === story.id ? 'Pausar' : 'Degustar'}
                </button>
              ) : (
                <button className="w-full py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] bg-zinc-950 border border-white/5 text-zinc-700 cursor-not-allowed">Acesso Restrito</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesView;
