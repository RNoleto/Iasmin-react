
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
      text: '*suspiro suave e risinho* Sabe... eu estava justamente pensando em você. Que bom que apareceu agora... Me conta, o que te trouxe aqui neste momento?', 
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
        text: '*voz suave* Sabe... eu adoraria continuar essa conversa por horas, mas meu tempo aqui é limitado para quem não faz parte do meu círculo íntimo. Que tal continuarmos isso em um lugar mais privado?', 
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
      const response = await chatServiceRef.current?.sendMessage(userText) || { text: "*te olho intensamente* ..." };
      setMessages(prev => [...prev, { role: 'model', text: response.text, timestamp: new Date() }]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
    const speechOnly = text.replace(/\*.*?\*/g, '').trim();
    if (!speechOnly && text.includes('*')) {
       return <span className="text-zinc-500 opacity-50 italic">...</span>;
    }
    return speechOnly;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] max-w-2xl mx-auto bg-[#030303]/80 rounded-[2rem] md:rounded-[3rem] border border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl relative group">
      <div className="p-4 md:p-7 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative z-10">
         <div className="flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black border border-rose-900/30 flex items-center justify-center overflow-hidden neon-border-rose">
               <div className="w-full h-full bg-gradient-to-br from-rose-950/40 to-black flex items-center justify-center text-[8px] md:text-[10px] text-rose-500 font-bold tracking-tighter">Ias</div>
            </div>
            <div>
               <h3 className="text-[9px] md:text-[11px] font-bold text-white tracking-[0.4em] md:tracking-[0.6em] uppercase neon-text-rose">Iasmin</h3>
               <div className="flex items-center gap-2 md:gap-2.5 mt-1">
                  <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full animate-pulse shadow-[0_0_5px_rgba(225,29,72,0.8)] ${subLevel === SubscriptionLevel.ELITE ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                  <p className="text-[7px] md:text-[8px] text-rose-500/80 font-bold uppercase tracking-[0.1em] md:tracking-[0.2em]">
                    {subLevel === SubscriptionLevel.FREE ? `${5 - messageCount}/5 Mensagens` : 'VIP BALNEÁRIO'}
                  </p>
               </div>
            </div>
         </div>
         <div className="text-[8px] uppercase tracking-widest text-zinc-600 font-bold">BC • Santa Catarina</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-12 space-y-8 md:space-y-14 scrollbar-hide relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            {msg.role === 'model' && (
               <button onClick={() => handleSpeak(msg.text, idx)} className={`mt-1 p-2.5 md:p-3.5 rounded-full transition-all border shrink-0 ${isSpeaking === idx ? 'bg-rose-950/40 text-rose-500 border-rose-900/40' : 'bg-white/5 text-zinc-700 border-transparent'}`}>
                  {isSpeaking === idx ? (
                    <div className="flex gap-0.5 items-center h-2.5">
                      <div className="w-0.5 h-full bg-current animate-[sound_0.6s_infinite]"></div>
                      <div className="w-0.5 h-2/3 bg-current animate-[sound_0.6s_infinite_0.2s]"></div>
                      <div className="w-0.5 h-full bg-current animate-[sound_0.6s_infinite_0.4s]"></div>
                    </div>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M11 5L6 9H2V15H6L11 19V5Z"/></svg>
                  )}
                </button>
            )}
            <div className={`max-w-[90%] md:max-w-[85%]`}>
              <div className={`p-4 md:p-7 md:px-9 rounded-[1.5rem] md:rounded-[2.5rem] text-[14px] md:text-[16px] leading-relaxed transition-all font-light ${msg.role === 'user' ? 'bg-zinc-900/40 border border-white/10 text-zinc-100 rounded-tr-none' : 'bg-rose-950/5 border border-rose-900/20 text-zinc-300 rounded-tl-none'}`}>
                {msg.role === 'model' ? renderMessageText(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start pl-2">
            <div className="flex gap-2 p-4 bg-white/[0.01] rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 bg-rose-900/60 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-rose-900/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-rose-900/60 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-10 bg-[#030303]/90 border-t border-white/5 backdrop-blur-3xl relative z-10">
        {subLevel === SubscriptionLevel.FREE && messageCount >= 5 ? (
          <button 
            onClick={() => onNavigate(View.SUBSCRIPTION)}
            className="w-full h-14 md:h-16 bg-rose-800 text-white rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] neon-border-rose"
          >
            Acessar Círculo Íntimo
          </button>
        ) : (
          <form onSubmit={handleSend} className="flex gap-3 md:gap-5">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Fale com a Iasmin..." 
              className="flex-1 bg-zinc-950 border border-white/5 rounded-full py-4 md:py-6 px-6 md:px-12 focus:outline-none focus:border-rose-900/50 transition-all text-xs md:text-sm tracking-widest placeholder:text-zinc-800" 
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="w-14 h-14 md:w-20 md:h-20 shrink-0 rounded-full bg-rose-800 text-white flex items-center justify-center hover:bg-rose-700 disabled:opacity-20 transition-all neon-border-rose">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </form>
        )}
      </div>
      <style>{`
        @keyframes sound { 0%, 100% { height: 3px; } 50% { height: 10px; } }
      `}</style>
    </div>
  );
};

export default ChatView;
