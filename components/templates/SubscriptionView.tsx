
import React from 'react';
import Button from '../atoms/Button';

const PLANS = [
  {
    name: 'Silver',
    price: 'R$ 29,90',
    period: 'mês',
    benefits: ['Acesso a 5 histórias exclusivas', 'Galeria básica (30 fotos)', 'Chat limitado (10 msgs/dia)'],
    recommended: false,
    color: 'zinc-400'
  },
  {
    name: 'Gold',
    price: 'R$ 59,90',
    period: 'mês',
    benefits: ['Todas as histórias narradas', 'Galeria completa (HD)', 'Chat prioritário ilimitado', 'Novas histórias semanais'],
    recommended: true,
    color: 'rose-500'
  },
  {
    name: 'Diamond',
    price: 'R$ 499,90',
    period: 'ano',
    benefits: ['Tudo do plano Gold', 'Peça uma história personalizada', 'Conteúdo 4K exclusivo', 'Brindes físicos semestrais'],
    recommended: false,
    color: 'sky-400'
  }
];

const SubscriptionView: React.FC = () => {
  return (
    <div className="space-y-16 py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif italic text-white">Escolha seu Nível</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">Garanta seu acesso VIP ao mundo de IASmin e desbloqueie todos os segredos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        {PLANS.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative p-8 rounded-3xl border ${
              plan.recommended ? 'border-rose-600 bg-rose-950/10 scale-105 z-10' : 'border-white/5 bg-zinc-900/40'
            } transition-transform hover:scale-[1.02]`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                Mais Popular
              </div>
            )}
            
            <div className="mb-8 space-y-2">
              <h3 className={`text-2xl font-bold text-${plan.color}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-zinc-500 text-sm">/{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.benefits.map((benefit, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-400">
                  <span className="text-rose-500">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>

            <Button variant={plan.recommended ? 'primary' : 'outline'} className="w-full">
              Assinar Agora
            </Button>
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto bg-zinc-900/30 p-8 rounded-3xl border border-white/5 text-center">
        <h3 className="text-xl font-bold mb-4">Pagamento Seguro e Discreto</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-6">
          Sua fatura aparecerá como "ASSINATURA DIGITAL" para garantir total privacidade. Aceitamos Pix, Cartão e Cripto.
        </p>
        <div className="flex justify-center gap-4 opacity-40 grayscale contrast-125">
           <span className="text-2xl">💳</span>
           <span className="text-2xl">📱</span>
           <span className="text-2xl">₿</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionView;
