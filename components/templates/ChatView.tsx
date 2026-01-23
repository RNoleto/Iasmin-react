
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { IASminChatService } from '../../services/geminiService';
import Button from '../atoms/Button';

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
      text: 'Estava sentindo sua falta... O que vamos imaginar juntos hoje? 😉', 
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

  useEffect(() => {
    chatServiceRef.current = new IASminChatService();
    return () => {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch (e) {}
      }
    };
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

  const handleSpeak = async (text: string, index: number) => {
    if (isSpeaking === index) {
      stopAudio();
      return;
    }

    stopAudio();
    setIsSpeaking(index);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioBase64 = await chatServiceRef.current?.generateNarration(text);
      
      if (audioBase64) {
        const audioData = decodeBase64(audioBase64);
        const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => setIsSpeaking(null);

        sourceNodeRef.current = source;
        source.start(0);
      }
    } catch (error) {
      console.error("Speech error:", error);
      setIsSpeaking(null);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    const userMessage: Message = { role: 'user', text: userText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatServiceRef.current?.sendMessage(userText);
      const modelMessage: Message = { 
        role: 'model', 
        text: response || "Me conte mais...", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] max-w-2xl mx-auto animate-in fade-in duration-700 bg-zinc-950/40 rounded-[2.5rem] border border-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">
      {/* Header do Chat */}
      <div className="p-5 border-b border-white/5 bg-zinc-900/20 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-rose-900 flex items-center justify-center text-xl shadow-lg shadow-rose-900/20">
              💋
            </div>
            <div>
               <h3 className="text-sm font-bold text-white leading-none">Iasmin</h3>
               <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Online agora</p>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group items-end gap-2`}
          >
            {msg.role === 'model' && (
               <button 
                  onClick={() => handleSpeak(msg.text, idx)}
                  className={`p-2 rounded-full transition-all text-xs ${isSpeaking === idx ? 'text-rose-500 bg-rose-500/10 scale-110' : 'text-zinc-600 hover:text-rose-400'}`}
                >
                  {isSpeaking === idx ? '🔊' : '🔈'}
                </button>
            )}
            
            <div className={`max-w-[80%] space-y-1`}>
              <div className={`
                p-3.5 px-5 rounded-2xl text-sm md:text-[15px] leading-snug transition-all
                ${msg.role === 'user' 
                  ? 'bg-rose-600 text-white rounded-br-none shadow-lg shadow-rose-900/20' 
                  : 'bg-zinc-800/80 border border-white/5 text-zinc-200 rounded-bl-none'}
              `}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start pl-2">
            <div className="flex gap-1 items-center bg-zinc-800/40 px-3 py-2 rounded-full border border-white/5">
                <div className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-rose-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-zinc-950/60 border-t border-white/5">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Diga algo..."
            className="flex-1 bg-zinc-900/80 border border-white/10 rounded-full py-3 px-6 focus:outline-none focus:border-rose-900/50 transition-all text-sm placeholder:text-zinc-600"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full bg-rose-700 text-white flex items-center justify-center hover:bg-rose-600 disabled:opacity-20 transition-all active:scale-90"
          >
            <span className="text-xl">→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
