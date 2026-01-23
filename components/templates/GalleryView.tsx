
import React from 'react';
import { Photo } from '../../types';

// Curated Unsplash IDs that fit the "IASmin" aesthetic: moody, elegant, and sophisticated.
const UNSPLASH_IDS = [
  'photo-1519011985187-444d62641929', // Moody portrait
  'photo-1522845015757-50bce044e5da', // Silhouette intimacy
  'photo-1531746020798-e6953c6e8e04', // Artistic focus
  'photo-1515886657613-9f3515b0c78f', // Sophisticated pose
  'photo-1492633423870-43d1cd2775eb', // Artistic abstract body
  'photo-1503342217505-b0a15ec3261c', // Dark moody water
  'photo-1529139513466-470460969242', // High fashion sensual
  'photo-1481824429379-07aa5e5b0739', // B&W cinematic
  'photo-1469334031218-e382a71b716b', // Elegant motion
  'photo-1506634064465-7dab4de896ed', // Intimate portrait
  'photo-1511527661048-7fe73d85e9a4', // Moody environment
  'photo-1494790108377-be9c29b29330', // Expressive beauty
];

const MOCK_PHOTOS: Photo[] = UNSPLASH_IDS.map((id, i) => ({
  id: String(i + 1),
  // Using Unsplash source URL with optimization parameters for better performance
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=800`,
  isLocked: i > 2 // Keep the first 3 unlocked as a teaser
}));

const GalleryView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif italic text-white">Galeria Privada</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">
          Momentos de intimidade capturados em alta definição. <br />
          Alguns segredos são revelados apenas a assinantes selecionados.
        </p>
      </div>

      {/* Masonry-like grid using CSS columns */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {MOCK_PHOTOS.map((photo) => (
          <div 
            key={photo.id} 
            className="relative group overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl transition-all duration-500 hover:border-rose-900/50"
          >
            <div className={`aspect-auto overflow-hidden ${photo.isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <img 
                src={photo.url} 
                alt="IASmin Exclusive Content" 
                loading="lazy"
                className={`w-full h-auto object-cover transition-all duration-1000 transform ${
                  photo.isLocked 
                    ? 'blur-3xl grayscale brightness-50 scale-110' 
                    : 'group-hover:scale-110 group-hover:brightness-110'
                }`}
              />
            </div>
            
            {/* Locked Overlay */}
            {photo.isLocked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40 backdrop-blur-[2px]">
                <div className="w-14 h-14 bg-rose-600/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-rose-500/30 mb-4 animate-pulse">
                  <span className="text-2xl">🔒</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90 drop-shadow-md">
                  Conteúdo Exclusivo
                </p>
                <p className="text-[9px] text-rose-300/80 mt-1">Plano Gold ou Diamond</p>
              </div>
            ) : (
              /* Hover Info for Unlocked Photos */
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                 <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white text-xs font-bold tracking-widest uppercase mb-1">Ensaio: Despertar</p>
                    <button className="text-rose-500 text-[10px] font-medium flex items-center gap-1 hover:text-rose-400 transition-colors">
                      VER EM ALTA RESOLUÇÃO 
                      <span className="text-lg">→</span>
                    </button>
                 </div>
              </div>
            )}

            {/* Subtle gloss effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 pointer-events-none transition-opacity duration-700"></div>
          </div>
        ))}
      </div>

      <div className="pt-12 text-center">
        <p className="text-zinc-600 text-xs italic">
          * Todas as imagens são protegidas por direitos autorais e destinadas apenas a assinantes.
        </p>
      </div>
    </div>
  );
};

export default GalleryView;
