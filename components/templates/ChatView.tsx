
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { IASminChatService } from '../../services/geminiService';
import Button from '../atoms/Button';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá, querido... Estava esperando por você. O que gostaria de me contar hoje?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatServiceRef = useRef<IASminChatService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatServiceRef.current = new IASminChatService();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (chatServiceRef.current) {
      const response = await chatServiceRef.current.sendMessage(input);
      const modelMessage: Message = { role: 'model', text: response, timestamp: new Date() };
      setMessages(prev => [...prev, modelMessage]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto h-[75vh] flex flex-col bg-zinc-900/40 rounded-3xl border border-white/5 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-zinc-900/60 flex items-center gap-4">
        <div className="relative">
          <img src="https://picsum.photos/id/64/100/100" className="w-12 h-12 rounded-full object-cover border-2 border-rose-600" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900"></div>
        </div>
        <div>
          <h3 className="font-bold text-white">IASmin</h3>
          <p className="text-xs text-rose-500 font-medium">Online agora</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
              msg.role === 'user' 
                ? 'bg-rose-700 text-white rounded-tr-none' 
                : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5'
            }`}>
              {msg.text}
              <div className={`text-[10px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/50 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-zinc-900/60 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Diga algo para mim..."
          className="flex-1 bg-zinc-800/50 border border-white/5 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-rose-700 transition-colors"
        />
        <Button 
          type="submit" 
          className="aspect-square !p-0 w-12 h-12 rounded-full shrink-0"
          disabled={!input.trim() || isLoading}
        >
          🚀
        </Button>
      </form>
    </div>
  );
};

export default ChatView;
