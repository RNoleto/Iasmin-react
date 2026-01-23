
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
      features: ["Acesso a 1 História Demo", "Chat limitado (5 msg/dia)", "Galeria básica", "Voz padrão"],
      button: "Começar Grátis",
      popular: false,
      color: "zinc"
    },
    {
      id: SubscriptionLevel.INTIMO,
      name: "Íntimo",
      price: "R$ 49",
      period: "/ mês",
      features: ["Todas as Histórias (Voz)", "Chat Ilimitado", "Galeria Completa", "Fotos em tempo real", "Sem anúncios"],
      button: "Assinar Agora",
      popular: true,
      color: "rose"
    },
    {
      id: SubscriptionLevel.ELITE,
      name: "Elite VIP",
      price: "R$ 399",
      period: "/ ano",
      features: ["Tudo do Plano Íntimo", "Prioridade Absoluta", "Pedidos de Áudio Customizados", "Acesso Antecipado", "Selo VIP no Perfil"],
      button: "Tornar-se Elite",
      popular: false,
      color: "amber"
    }
  ];

  return (
    <div className="space-y-20 py-12 animate-in fade-in duration-1000">
      <div className="text-center space-y-6">
        <h2 className="text-6xl font-serif italic text-white tracking-tighter neon-text-rose">Escolha seu Nível</h2>
        <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase font-light">O quão perto você quer chegar?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative group p-10 rounded-[3.5rem] bg-[#030303] border transition-all duration-700 flex flex-col justify-between ${
              plan.popular ? 'border-rose-900/50 shadow-[0_0_50px_rgba(225,29,72,0.1)] scale-105 z-10' : 'border-white/5 hover:border-white/10'
            } ${plan.id === SubscriptionLevel.ELITE ? 'hover:border-amber-900/40 shadow-[0_0_50px_rgba(245,158,11,0.05)]' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-rose-700 text-white text-[9px] font-bold uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-xl neon-border-rose">
                Mais Desejado
              </div>
            )}

            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className={`text-2xl font-serif italic ${plan.id === SubscriptionLevel.ELITE ? 'text-amber-500' : 'text-white'}`}>{plan.name}</h3>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-4xl font-bold tracking-tighter">{plan.price}</span>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest pb-1.5">{plan.period}</span>
                </div>
              </div>

              <div className="h-[1px] w-full bg-white/5"></div>

              <ul className="space-y-5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-4 text-[13px] text-zinc-500 font-light items-start">
                    <span className={plan.id === SubscriptionLevel.ELITE ? 'text-amber-600' : 'text-rose-700'}>✦</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              variant={plan.popular ? 'primary' : 'outline'} 
              className={`w-full h-16 mt-12 text-[10px] uppercase tracking-[0.3em] ${
                plan.id === SubscriptionLevel.ELITE ? 'border-amber-900/30 text-amber-500 hover:bg-amber-900/10' : ''
              }`}
              onClick={() => onSubscribe(plan.id)}
            >
              {plan.button}
            </Button>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[10px] text-zinc-800 uppercase tracking-[0.4em] mb-4">Pagamento Seguro & Sigilo Absoluto</p>
      </div>
    </div>
  );
};

export default SubscriptionView;
