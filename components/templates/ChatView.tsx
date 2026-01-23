
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
      text: '*estou sentada no meu sofá de veludo, balançando levemente uma taça de vinho e olhando para a porta quando você entra* Sabe... eu estava justamente pensando em você. Demorou para aparecer hoje... *sorrio de canto, te convidando a sentar ao meu lado*', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  
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

    if (subLevel === SubscriptionLevel.FREE && messageCount >= 5) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: '*te olho com um pouco de saudade* Sabe... eu adoraria continuar essa conversa a noite toda, mas meu tempo aqui é limitado para quem não faz parte do meu círculo íntimo. Que tal continuarmos isso em um lugar mais privado?', 
        timestamp: new Date() 
      }]);
      setInput('');
      return;
    }

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const response = await chatServiceRef.current?.sendMessage(userText) || { text: "*te olho intensamente, sem palavras por um momento...*" };
      setMessages(prev => [...prev, { role: 'model', text: response.text, imageUrl: response.imageUrl, timestamp: new Date() }]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <span key={i} className="text-rose-400/90 italic font-light neon-text-rose">{part.replace(/\*/g, '')}</span>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-160px)] max-w-2xl mx-auto bg-[#030303]/80 rounded-[3rem] border border-white/5 backdrop-blur-3xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] relative group">
      <div className="absolute inset-0 border border-rose-900/10 rounded-[3rem] pointer-events-none group-focus-within:border-rose-900/30 transition-colors duration-1000"></div>

      <div className="p-7 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative z-10">
         <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-black border border-rose-900/30 flex items-center justify-center overflow-hidden neon-border-rose">
               <div className="w-full h-full bg-gradient-to-br from-rose-950/40 to-black flex items-center justify-center text-[10px] text-rose-500 font-bold tracking-tighter">Ias</div>
            </div>
            <div>
               <h3 className="text-[11px] font-bold text-white tracking-[0.6em] uppercase neon-text-rose">Iasmin</h3>
               <div className="flex items-center gap-2.5 mt-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_5px_rgba(225,29,72,0.8)] ${subLevel === SubscriptionLevel.ELITE ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                  <p className="text-[8px] text-rose-500/80 font-bold uppercase tracking-[0.2em]">
                    {subLevel === SubscriptionLevel.FREE ? `MENSAGENS: ${5 - messageCount}/5` : 'CHAT ILIMITADO VIP'}
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12 space-y-14 scrollbar-hide relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            {msg.role === 'model' && (
               <button onClick={() => handleSpeak(msg.text, idx)} className={`mt-2 p-3.5 rounded-full transition-all border ${isSpeaking === idx ? 'bg-rose-950/40 text-rose-500 border-rose-900/40' : 'bg-white/5 text-zinc-700 border-transparent hover:text-rose-500 hover:border-rose-900/20'}`}>
                  {isSpeaking === idx ? (
                    <div className="flex gap-1 items-center h-3">
                      <div className="w-0.5 h-full bg-current animate-[sound_0.6s_infinite]"></div>
                      <div className="w-0.5 h-2/3 bg-current animate-[sound_0.6s_infinite_0.2s]"></div>
                      <div className="w-0.5 h-full bg-current animate-[sound_0.6s_infinite_0.4s]"></div>
                    </div>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M11 5L6 9H2V15H6L11 19V5Z"/></svg>
                  )}
                </button>
            )}
            <div className={`max-w-[85%] space-y-6`}>
              {msg.imageUrl && (
                <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 neon-border-rose">
                  <img src={msg.imageUrl} alt="Momento íntimo" className="w-full h-auto max-h-[500px] object-cover" />
                </div>
              )}
              <div className={`p-7 px-9 rounded-[2.5rem] text-[15px] leading-relaxed tracking-wide transition-all font-light ${msg.role === 'user' ? 'bg-zinc-900/40 border border-white/10 text-zinc-100 rounded-tr-none' : 'bg-rose-950/5 border border-rose-900/20 text-zinc-300 rounded-tl-none shadow-[0_0_20px_rgba(225,29,72,0.02)]'}`}>
                {renderMessageText(msg.text)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start pl-4">
            <div className="flex gap-3 p-6 bg-white/[0.01] rounded-full border border-white/5">
                <div className="w-2 h-2 bg-rose-900/60 rounded-full animate-bounce shadow-sm"></div>
                <div className="w-2 h-2 bg-rose-900/60 rounded-full animate-bounce [animation-delay:0.2s] shadow-sm"></div>
                <div className="w-2 h-2 bg-rose-900/60 rounded-full animate-bounce [animation-delay:0.4s] shadow-sm"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-10 bg-[#030303]/90 border-t border-white/5 backdrop-blur-3xl relative z-10">
        {subLevel === SubscriptionLevel.FREE && messageCount >= 5 ? (
          <button 
            onClick={() => onNavigate(View.SUBSCRIPTION)}
            className="w-full h-16 bg-rose-800 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] neon-border-rose hover:bg-rose-700 transition-all"
          >
            Continuar conversa no Círculo Íntimo
          </button>
        ) : (
          <form onSubmit={handleSend} className="flex gap-5">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Diga o que você está sentindo..." 
              className="flex-1 bg-zinc-950 border border-white/5 rounded-full py-6 px-12 focus:outline-none focus:border-rose-900/50 transition-all text-sm tracking-widest placeholder:text-zinc-800 placeholder:italic font-light" 
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="w-20 h-20 rounded-full bg-rose-800 text-white flex items-center justify-center hover:bg-rose-700 disabled:opacity-20 transition-all shadow-xl shadow-rose-900/20 neon-border-rose">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatView;
