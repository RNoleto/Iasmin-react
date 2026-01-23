
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { IASminChatService, ChatResult } from '../../services/geminiService';

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

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: '*suspiro* Estava sentindo sua falta... O que vamos imaginar juntos hoje? 😉', 
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
      const response = await chatServiceRef.current?.sendMessage(userText) || { text: "*suspiro*..." };
      setMessages(prev => [...prev, { role: 'model', text: response.text, imageUrl: response.imageUrl, timestamp: new Date() }]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayText = (text: string) => {
    // Remove qualquer texto entre asteriscos para o chat visual
    return text.replace(/\*.*?\*/g, '').replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-160px)] max-w-2xl mx-auto bg-[#080808] rounded-[3rem] border border-white/5 backdrop-blur-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]">
      <div className="p-6 border-b border-white/5 bg-zinc-900/10 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="1"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 8v8M8 12h8"/></svg>
            </div>
            <div>
               <h3 className="text-[10px] font-bold text-white tracking-[0.3em] uppercase">Iasmin</h3>
               <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse"></div>
                  <p className="text-[8px] text-rose-500 font-bold uppercase tracking-widest">Conectada</p>
               </div>
            </div>
         </div>
         <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[7px] font-bold text-zinc-500 uppercase tracking-widest">
            Neural Voice HD
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-4`}>
            {msg.role === 'model' && (
               <button onClick={() => handleSpeak(msg.text, idx)} className={`p-3.5 rounded-full transition-all ${isSpeaking === idx ? 'bg-rose-600 text-white' : 'bg-white/5 text-zinc-600 hover:text-rose-500 border border-white/5'}`}>
                  {isSpeaking === idx ? (
                    <div className="flex gap-0.5 items-center h-3">
                      <div className="w-0.5 h-full bg-white animate-[pulse_0.6s_infinite]"></div>
                      <div className="w-0.5 h-2/3 bg-white animate-[pulse_0.6s_infinite_0.2s]"></div>
                      <div className="w-0.5 h-full bg-white animate-[pulse_0.6s_infinite_0.4s]"></div>
                    </div>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M11 5L6 9H2V15H6L11 19V5Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  )}
                </button>
            )}
            <div className={`max-w-[75%] space-y-4`}>
              {msg.imageUrl && (
                <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl animate-in zoom-in-95 duration-700">
                  <img src={msg.imageUrl} alt="Momento" className="w-full h-auto max-h-96 object-cover" />
                </div>
              )}
              <div className={`p-5 px-7 rounded-[2rem] text-[13px] leading-relaxed tracking-wide transition-all ${msg.role === 'user' ? 'bg-rose-700/90 text-white rounded-br-none' : 'bg-[#121212] border border-white/5 text-zinc-300 rounded-bl-none shadow-xl'}`}>
                {msg.role === 'model' ? formatDisplayText(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 p-5 bg-zinc-900/20 rounded-full border border-white/5">
                <div className="w-1 h-1 bg-rose-500/60 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-rose-500/60 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-rose-500/60 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-[#060606] border-t border-white/5">
        <form onSubmit={handleSend} className="flex gap-4">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Sussurre para ela..." className="flex-1 bg-zinc-900/40 border border-white/5 rounded-full py-4 px-8 focus:outline-none focus:border-rose-900/40 transition-all text-xs tracking-widest placeholder:text-zinc-700" />
          <button type="submit" disabled={!input.trim() || isLoading} className="w-14 h-14 rounded-full bg-rose-900/80 text-white flex items-center justify-center hover:bg-rose-800 disabled:opacity-20 transition-all active:scale-95 border border-white/5 shadow-2xl">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
