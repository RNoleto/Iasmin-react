
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
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] max-w-2xl mx-auto bg-zinc-950/40 rounded-[2.5rem] border border-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-white/5 bg-zinc-900/20 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-rose-950 flex items-center justify-center border border-rose-500/20 shadow-lg">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M16 11c0 2.209-1.791 4-4 4s-4-1.791-4-4 1.791-4 4-4 4 1.791 4 4z"/></svg>
            </div>
            <div>
               <h3 className="text-xs font-bold text-white tracking-widest uppercase">Iasmin</h3>
               <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse"></div>
                  <p className="text-[9px] text-rose-500 font-bold uppercase tracking-[0.2em]">Sintonizada</p>
               </div>
            </div>
         </div>
         <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
            Neural HD Audio
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
            {msg.role === 'model' && (
               <button onClick={() => handleSpeak(msg.text, idx)} className={`p-3 rounded-full transition-all ${isSpeaking === idx ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/30' : 'bg-white/5 text-zinc-500 hover:text-rose-400 border border-white/5'}`}>
                  {isSpeaking === idx ? (
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 bg-white animate-[soundbar_0.8s_infinite]"></div>
                      <div className="w-0.5 bg-white animate-[soundbar_0.8s_infinite_0.2s]"></div>
                      <div className="w-0.5 bg-white animate-[soundbar_0.8s_infinite_0.4s]"></div>
                    </div>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  )}
                </button>
            )}
            <div className={`max-w-[80%] space-y-3`}>
              {msg.imageUrl && (
                <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                  <img src={msg.imageUrl} alt="Exclusivo" className="w-full h-auto max-h-80 object-cover" />
                </div>
              )}
              <div className={`p-4 px-6 rounded-3xl text-[14px] leading-relaxed transition-all ${msg.role === 'user' ? 'bg-rose-700 text-white rounded-br-none' : 'bg-zinc-900 border border-white/5 text-zinc-300 rounded-bl-none'}`}>
                {msg.role === 'model' ? formatDisplayText(msg.text) : msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 p-4 bg-zinc-900/40 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 bg-rose-500/50 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-rose-500/50 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-rose-500/50 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-zinc-950/60 border-t border-white/5">
        <form onSubmit={handleSend} className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Sussurre algo..." className="flex-1 bg-zinc-900/80 border border-white/10 rounded-full py-4 px-8 focus:outline-none focus:border-rose-900/50 transition-all text-sm placeholder:text-zinc-700" />
          <button type="submit" disabled={!input.trim() || isLoading} className="w-14 h-14 rounded-full bg-rose-800 text-white flex items-center justify-center hover:bg-rose-700 disabled:opacity-20 transition-all shadow-xl shadow-rose-950/50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
      <style>{`@keyframes soundbar { 0%, 100% { height: 4px; } 50% { height: 12px; } }`}</style>
    </div>
  );
};

export default ChatView;
