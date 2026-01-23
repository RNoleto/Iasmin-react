
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
    return text.replace(/\*.*?\*/g, '').replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-160px)] max-w-2xl mx-auto bg-[#050505] rounded-[2.5rem] border border-white/5 backdrop-blur-3xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-950 border border-rose-900/20 flex items-center justify-center">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9f1239" strokeWidth="0.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
            </div>
            <div>
               <h3 className="text-[9px] font-bold text-white tracking-[0.5em] uppercase">Iasmin</h3>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-1 h-1 bg-rose-600 rounded-full animate-pulse"></div>
                  <p className="text-[7px] text-rose-800 font-bold uppercase tracking-widest">Live Neural</p>
               </div>
            </div>
         </div>
         <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[6px] font-bold text-zinc-600 uppercase tracking-widest">
            24-bit Lossless
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-5`}>
            {msg.role === 'model' && (
               <button onClick={() => handleSpeak(msg.text, idx)} className={`p-4 rounded-full transition-all ${isSpeaking === idx ? 'bg-rose-950/40 text-rose-500 border border-rose-900/30' : 'bg-white/5 text-zinc-700 hover:text-rose-900 border border-white/5'}`}>
                  {isSpeaking === idx ? (
                    <div className="flex gap-1 items-center h-2.5">
                      <div className="w-0.5 h-full bg-current animate-[sound_0.6s_infinite]"></div>
                      <div className="w-0.5 h-2/3 bg-current animate-[sound_0.6s_infinite_0.2s]"></div>
                      <div className="w-0.5 h-full bg-current animate-[sound_0.6s_infinite_0.4s]"></div>
                    </div>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5L6 9H2V15H6L11 19V5Z"/></svg>
                  )}
                </button>
            )}
            <div className={`max-w-[80%] space-y-5`}>
              {msg.imageUrl && (
                <div className="rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner animate-in fade-in zoom-in-95 duration-1000">
                  <img src={msg.imageUrl} alt="Momento" className="w-full h-auto max-h-[400px] object-cover contrast-[1.05]" />
                </div>
              )}
              <div className={`p-6 px-8 rounded-[2rem] text-[13px] leading-relaxed tracking-wider transition-all ${msg.role === 'user' ? 'bg-rose-900/20 border border-rose-900/10 text-rose-100 rounded-br-none shadow-lg shadow-rose-950/20' : 'bg-[#0a0a0a] border border-white/5 text-zinc-400 rounded-bl-none'}`}>
                {msg.role === 'model' ? formatDisplayText(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start pl-2">
            <div className="flex gap-2.5 p-6 bg-white/[0.01] rounded-full border border-white/5">
                <div className="w-1 h-1 bg-rose-900/40 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-rose-900/40 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-rose-900/40 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-8 bg-black/40 border-t border-white/5 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex gap-4">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Sussurre algo..." className="flex-1 bg-zinc-900/20 border border-white/5 rounded-full py-5 px-10 focus:outline-none focus:border-rose-950/40 transition-all text-xs tracking-[0.1em] placeholder:text-zinc-800" />
          <button type="submit" disabled={!input.trim() || isLoading} className="w-16 h-16 rounded-full bg-rose-950/30 text-rose-600 flex items-center justify-center hover:bg-rose-900/40 disabled:opacity-10 transition-all border border-rose-900/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          </button>
        </form>
      </div>
      <style>{`
        @keyframes sound { 0%, 100% { height: 4px; opacity: 0.5; } 50% { height: 10px; opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ChatView;
