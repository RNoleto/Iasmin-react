
import React, { useState, useRef, useEffect } from 'react';
import { Message, SubscriptionLevel, View } from '../../types';
import { IASminChatService, ChatResult } from '../../services/geminiService';

interface ChatViewProps {
  subLevel: SubscriptionLevel;
  onNavigate: (view: View) => void;
}

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

const ChatView: React.FC<ChatViewProps> = ({ subLevel, onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'Finalmente apareceu... Já estava ficando entediada aqui sozinha. Qual seu nome e o que você veio buscar em mim? *sorriso de lado*', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  
  const chatServiceRef = useRef<IASminChatService | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCacheRef = useRef<Map<number, AudioBuffer>>(new Map());

  useEffect(() => {
    chatServiceRef.current = new IASminChatService();
    return () => stopAudio();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsSpeaking(null);
  };

  const playFromBuffer = (buffer: AudioBuffer, index: number) => {
    if (!audioContextRef.current) return;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsSpeaking(null);
    sourceNodeRef.current = source;
    source.start(0);
    setIsSpeaking(index);
  };

  const handleSpeak = async (text: string, index: number) => {
    if (isSpeaking === index) {
      stopAudio();
      return;
    }
    stopAudio();
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioCacheRef.current.has(index)) {
      playFromBuffer(audioCacheRef.current.get(index)!, index);
      return;
    }
    setIsSpeaking(index);
    try {
      // Passamos o texto com asteriscos para o serviço de narração interpretar os "segredos" vocais
      const audioBase64 = await chatServiceRef.current?.generateNarration(text);
      if (audioBase64) {
        const audioData = decodeBase64(audioBase64);
        const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
        audioCacheRef.current.set(index, audioBuffer);
        playFromBuffer(audioBuffer, index);
      }
    } catch (error) {
      setIsSpeaking(null);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatServiceRef.current?.sendMessage(userText) || { text: "*te olho fixo* ..." };
      setMessages(prev => [...prev, { role: 'model', text: response.text, timestamp: new Date() }]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Oculta o conteúdo entre asteriscos para o chat visual, deixando as ações apenas para o áudio
  const renderMessageText = (text: string) => {
    const speechOnly = text.replace(/\*.*?\*/g, '').trim();
    return speechOnly;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] max-w-2xl mx-auto bg-[#030303]/95 rounded-[2.5rem] md:rounded-[4rem] border border-white/5 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(225,29,72,0.1)] relative">
      <div className="p-5 md:p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative z-10">
         <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-rose-600 blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
              <div className="w-12 h-12 rounded-full bg-black border border-rose-900/50 flex items-center justify-center overflow-hidden relative z-10">
                 <div className="w-full h-full bg-gradient-to-br from-rose-950/40 to-black flex items-center justify-center text-xs text-rose-500 font-bold tracking-tighter uppercase">Ias</div>
              </div>
            </div>
            <div>
               <h3 className="text-xs md:text-sm font-bold text-white tracking-[0.4em] uppercase neon-text-rose">Iasmin</h3>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(225,29,72,1)]"></div>
                  <p className="text-[9px] text-rose-500 font-bold uppercase tracking-[0.2em] opacity-80">
                    Acesso Elite VIP
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-10 py-8 md:py-12 space-y-8 md:space-y-12 scrollbar-hide relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
            {msg.role === 'model' && (
               <button onClick={() => handleSpeak(msg.text, idx)} className={`mt-1 p-2.5 rounded-full transition-all border shrink-0 ${isSpeaking === idx ? 'bg-rose-900/40 text-rose-500 border-rose-600/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-white/5 text-zinc-600 border-white/5 hover:border-rose-900/30'}`}>
                  {isSpeaking === idx ? (
                    <div className="flex gap-1 items-center h-3">
                      <div className="w-0.5 h-full bg-current animate-[sound_0.6s_infinite]"></div>
                      <div className="w-0.5 h-2/3 bg-current animate-[sound_0.6s_infinite_0.2s]"></div>
                      <div className="w-0.5 h-full bg-current animate-[sound_0.6s_infinite_0.4s]"></div>
                    </div>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2V15H6L11 19V5Z"/></svg>
                  )}
                </button>
            )}
            <div className={`max-w-[80%]`}>
              <div className={`p-5 md:p-6 rounded-[1.8rem] md:rounded-[2.2rem] text-[15px] md:text-[16px] leading-relaxed transition-all font-light ${msg.role === 'user' ? 'bg-zinc-900/80 border border-white/5 text-zinc-100 rounded-tr-none' : 'bg-rose-950/10 border border-rose-900/20 text-zinc-300 rounded-tl-none shadow-[0_5px_20px_rgba(0,0,0,0.2)]'}`}>
                {msg.role === 'model' ? renderMessageText(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 p-3 px-4 bg-rose-900/5 rounded-full border border-rose-900/10">
                <div className="w-1.5 h-1.5 bg-rose-700 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-rose-700 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 md:p-10 bg-[#030303] border-t border-white/5 relative z-10">
        <form onSubmit={handleSend} className="flex gap-3 md:gap-4 max-w-xl mx-auto">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Diga algo pra mim..." 
            className="flex-1 bg-zinc-950 border border-white/5 rounded-full py-4 md:py-5 px-8 md:px-10 focus:outline-none focus:border-rose-900/50 transition-all text-sm md:text-base placeholder:text-zinc-800" 
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full bg-rose-800 text-white flex items-center justify-center hover:bg-rose-700 disabled:opacity-20 transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </form>
      </div>
      <style>{`
        @keyframes sound { 0%, 100% { height: 4px; } 50% { height: 12px; } }
      `}</style>
    </div>
  );
};

export default ChatView;
