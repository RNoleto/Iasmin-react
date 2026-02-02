import React, { useState, useRef, useEffect } from 'react';
import { Message, SubscriptionLevel, View } from '../../types';
import { api } from '../../services/api';

interface ChatViewProps {
  subLevel: SubscriptionLevel;
  onNavigate: (view: View) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ subLevel, onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'Oi... tava te esperando. *sorriso* Qual seu nome?', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Controle de Áudio
  const [isPlayingIndex, setIsPlayingIndex] = useState<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null); 
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const cleanText = (text: string) => text.replace(/\*.*?\*/g, '').trim();

  // --- TOCAR ÁUDIO (SIMPLIFICADO PARA MP3) ---
  const handlePlayAudio = async (text: string, index: number) => {
    // Lógica de Pause/Stop se clicar no mesmo botão
    if (isPlayingIndex === index) {
        currentAudioRef.current?.pause();
        setIsPlayingIndex(null);
        return;
    }

    // Para qualquer outro áudio tocando
    if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
    }

    setIsPlayingIndex(index); // Marca como carregando/tocando

    try {
        const audioBase64 = await api.generateAudio(text);
        
        if (!audioBase64) {
            console.error("Áudio não veio do backend");
            setIsPlayingIndex(null);
            return;
        }

        // A biblioteca gratuita retorna MP3 padrão.
        // O navegador toca isso nativamente, sem precisar de conversão WAV.
        const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
        
        const audio = new Audio(audioSrc);
        audio.volume = 1.0;

        audio.onended = () => {
            setIsPlayingIndex(null);
            currentAudioRef.current = null;
        };

        audio.onerror = (e) => {
            console.error("Erro no player:", e);
            setIsPlayingIndex(null);
        };

        currentAudioRef.current = audio;
        await audio.play();

    } catch (e) {
        console.error("Erro geral no player:", e);
        setIsPlayingIndex(null);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setIsLoading(true);

    const newMessages = [...messages, { role: 'user', text: userText, timestamp: new Date() }];
    setMessages(newMessages as Message[]);

    try {
      const history = newMessages.slice(-6).map(m => 
        `${m.role === 'user' ? 'USER' : 'IASMIN'}: ${m.text}`
      );

      const reply = await api.sendMessage(userText, history);

      if (reply) {
        setMessages(prev => [...prev, { role: 'model', text: reply, timestamp: new Date() }]);
      }

    } catch (error) {
      console.error("Erro no chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] max-w-2xl mx-auto bg-[#030303]/95 rounded-[2.5rem] md:rounded-[4rem] border border-white/5 backdrop-blur-3xl overflow-hidden shadow-[0_0_100px_rgba(225,29,72,0.1)] relative">
      
      {/* HEADER */}
      <div className="p-5 md:p-8 border-b border-white/5 bg-white/[0.01] flex items-center justify-between relative z-10">
         <div className="flex items-center gap-4">
            <div className="relative group">
               <div className="w-12 h-12 rounded-full bg-rose-950/20 border border-rose-900/50 flex items-center justify-center text-rose-500 font-bold">I</div>
            </div>
            <div>
               <h3 className="text-sm font-bold text-white tracking-widest uppercase">Iasmin</h3>
               <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest opacity-80">Online</p>
            </div>
         </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-5 md:px-10 py-8 space-y-8 scrollbar-hide relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}>
            
            {/* Botão de Áudio */}
            {msg.role === 'model' && (
               <button 
                 onClick={() => handlePlayAudio(msg.text, idx)}
                 className={`mt-2 p-2 rounded-full transition-all border ${isPlayingIndex === idx ? 'bg-rose-600 text-white border-rose-500' : 'bg-white/5 text-zinc-500 border-white/10 hover:text-rose-400'}`}
               >
                 {isPlayingIndex === idx ? (
                    <div className="flex gap-0.5 items-end h-3">
                        <span className="w-0.5 h-full bg-current animate-pulse"></span>
                        <span className="w-0.5 h-2/3 bg-current animate-pulse delay-75"></span>
                        <span className="w-0.5 h-full bg-current animate-pulse delay-150"></span>
                    </div>
                 ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                 )}
               </button>
            )}

            <div className={`max-w-[80%] p-5 rounded-3xl text-[15px] leading-relaxed font-light ${msg.role === 'user' ? 'bg-zinc-800 text-white rounded-tr-sm' : 'bg-rose-950/20 border border-rose-900/20 text-zinc-200 rounded-tl-sm'}`}>
                {msg.role === 'model' ? cleanText(msg.text) : msg.text}
            </div>
          </div>
        ))}
        {isLoading && <p className="text-zinc-600 text-xs ml-14 animate-pulse">Digitando...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-6 bg-black/50 border-t border-white/5">
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Mensagem..." 
            className="flex-1 bg-zinc-900 border border-white/10 rounded-full py-4 px-6 text-white focus:border-rose-900 focus:outline-none"
          />
          <button type="submit" disabled={!input.trim()} className="w-14 h-14 rounded-full bg-rose-700 text-white flex items-center justify-center hover:bg-rose-600 transition-all">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;