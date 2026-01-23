
import React from 'react';
import { Photo } from '../../types';

// Unsplash IDs mais sensuais e artísticos (Boudoir, High Fashion, Moody Portraits)
const UNSPLASH_IDS = [
  'photo-1519011985187-444d62641929', // Sensual moody
  'photo-1522845015757-50bce044e5da', // Silhouette body
  'photo-1529139513466-470460969242', // Artistic lingerie/fashion
  'photo-1515886657613-9f3515b0c78f', // High fashion portrait
  'photo-1506634064465-7dab4de896ed', // Moody close up
  'photo-1494790108377-be9c29b29330', // Sensual expression
  'photo-1503342217505-b0a15ec3261c', // Skin texture / water
  'photo-1481824429379-07aa5e5b0739', // B&W Artistic
  'photo-1469334031218-e382a71b716b', // Movement / silk
  'photo-1511527661048-7fe73d85e9a4', // Intimate lighting
  'photo-1524504388940-b1c1722653e1', // Elegant woman portrait
  'photo-1500648767791-00dcc994a43e', // Strong portrait
];

const MOCK_PHOTOS: Photo[] = UNSPLASH_IDS.map((id, i) => ({
  id: String(i + 1),
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=800`,
  isLocked: i > 2 // Primeiras 3 grátis para teaser
}));

const GalleryView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif italic text-white">Galeria Privada</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">
          Minhas visões mais íntimas, reveladas apenas a quem deseja ver além. <br />
          Capturando a essência do desejo em cada detalhe.
        </p>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-4">
        {MOCK_PHOTOS.map((photo) => (
          <div 
            key={photo.id} 
            className="relative group overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl transition-all duration-500 hover:border-rose-900/50"
          >
            <div className={`aspect-auto overflow-hidden ${photo.isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <img 
                src={photo.url} 
                alt="IASmin Exclusive Content" 
                loading="lazy"
                className={`w-full h-auto object-cover transition-all duration-1000 transform ${
                  photo.isLocked 
                    ? 'blur-[40px] grayscale brightness-75 scale-110' 
                    : 'group-hover:scale-110 group-hover:brightness-110'
                }`}
              />
            </div>
            
            {/* Locked Overlay / Efeito de Censura */}
            {photo.isLocked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/20 backdrop-blur-[2px] group-hover:bg-black/40 transition-colors duration-500">
                <div className="w-14 h-14 bg-rose-600/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-rose-500/30 mb-4 animate-pulse group-hover:scale-110 transition-transform duration-500">
                  <span className="text-2xl">🔒</span>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 drop-shadow-md">
                    Censurado
                  </p>
                  <p className="text-[9px] text-rose-300/80 font-medium">Desbloqueie para ver o ensaio</p>
                </div>
              </div>
            ) : (
              /* Hover Info para fotos liberadas */
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                 <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 w-full">
                    <p className="text-white text-xs font-bold tracking-widest uppercase mb-1">Ensaio: Desejo Puro</p>
                    <button className="text-rose-500 text-[10px] font-bold flex items-center gap-1 hover:text-rose-400 transition-colors uppercase tracking-widest">
                      Visualizar HD 
                      <span className="text-lg">→</span>
                    </button>
                 </div>
              </div>
            )}

            {/* Brilho sutil no hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 pointer-events-none transition-opacity duration-700"></div>
          </div>
        ))}
      </div>

      <div className="pt-12 text-center">
        <div className="inline-block p-1 rounded-full bg-rose-600/10 border border-rose-600/20 mb-4 px-4 py-2">
           <p className="text-rose-500 text-[10px] font-bold uppercase tracking-[0.3em]">Novos Ensaios Toda Semana</p>
        </div>
        <p className="text-zinc-600 text-xs italic">
          * Todas as imagens são protegidas por direitos autorais. Reprodução proibida.
        </p>
      </div>
    </div>
  );
};

export default GalleryView;
