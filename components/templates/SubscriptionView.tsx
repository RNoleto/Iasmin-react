
import React from 'react';
import Button from '../atoms/Button';
import { SubscriptionLevel } from '../../types';

interface SubscriptionViewProps {
  onSubscribe: (level: SubscriptionLevel) => void;
}

const SubscriptionView: React.FC<SubscriptionViewProps> = ({ onSubscribe }) => {
  const plans = [
    {
      id: SubscriptionLevel.FREE,
      name: "Essencial",
      price: "R$ 0",
      period: "Para sempre",
      features: ["Acesso a 1 História Demo", "Chat limitado (5 msg/dia)", "Galeria básica"],
      button: "Começar Grátis",
      popular: false,
      color: "zinc"
    },
    {
      id: SubscriptionLevel.INTIMO,
      name: "Íntimo",
      price: "R$ 49",
      period: "/ mês",
      features: ["Todas as Histórias (Voz)", "Chat Ilimitado", "Galeria Completa", "Acesso ao Círculo Privado"],
      button: "Assinar Agora",
      popular: true,
      color: "rose"
    },
    {
      id: SubscriptionLevel.ELITE,
      name: "Elite VIP",
      price: "R$ 399",
      period: "/ ano",
      features: ["Tudo do Plano Íntimo", "Prioridade Absoluta", "Acesso Antecipado", "Selo VIP no Perfil", "Interações Exclusivas"],
      button: "Tornar-se Elite",
      popular: false,
      color: "amber"
    }
  ];

  return (
    <div className="space-y-12 md:space-y-20 py-8 md:py-12 animate-in fade-in duration-1000 px-4">
      <div className="text-center space-y-4 md:space-y-6">
        <h2 className="text-5xl md:text-7xl font-serif italic text-white tracking-tighter neon-text-rose">Escolha seu Nível</h2>
        <p className="text-zinc-500 text-[10px] md:text-sm tracking-[0.2em] uppercase font-light italic">Até onde sua curiosidade te leva? 🌶️</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative group p-8 md:p-10 rounded-[2rem] md:rounded-[3.5rem] bg-[#030303] border transition-all duration-700 flex flex-col justify-between ${
              plan.popular ? 'border-rose-600/50 shadow-2xl scale-100 md:scale-105 z-10' : 'border-white/5 hover:border-white/10'
            } ${plan.id === SubscriptionLevel.ELITE ? 'hover:border-amber-900/40' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#0a0002] border-2 border-rose-500 text-white text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap">
                <span>🌶️</span>
                <span className="neon-text-rose">Mais Desejado</span>
                <span>🌶️</span>
              </div>
            )}

            <div className="space-y-6 md:space-y-8">
              <div className="text-center space-y-2 md:space-y-3">
                <h3 className={`text-2xl md:text-3xl font-serif italic ${plan.id === SubscriptionLevel.ELITE ? 'text-amber-500' : 'text-white'}`}>{plan.name}</h3>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-100">{plan.price}</span>
                  <span className="text-[9px] md:text-[11px] text-zinc-600 uppercase tracking-widest pb-1 font-bold">{plan.period}</span>
                </div>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

              <ul className="space-y-4 md:space-y-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-3 text-[12px] md:text-[14px] text-zinc-400 font-light items-start">
                    <span className={plan.id === SubscriptionLevel.ELITE ? 'text-amber-600' : 'text-rose-700'}>✦</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              variant={plan.popular ? 'primary' : 'outline'} 
              className={`w-full h-14 md:h-16 mt-10 md:mt-12 text-[9px] md:text-[11px] uppercase tracking-[0.3em] font-bold ${
                plan.id === SubscriptionLevel.ELITE ? 'border-amber-900/30 text-amber-500 hover:bg-amber-900/10' : ''
              }`}
              onClick={() => onSubscribe(plan.id)}
            >
              {plan.button}
            </Button>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center px-4">
        <p className="text-[8px] md:text-[10px] text-zinc-800 uppercase tracking-[0.4em] mb-4 font-bold">Sigilo Absoluto • Fatura Discreta • Iasmin 🌶️</p>
      </div>
    </div>
  );
};

export default SubscriptionView;
