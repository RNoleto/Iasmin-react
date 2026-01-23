
import React from 'react';
import { Photo } from '../../types';

const GALLERY_IDS = [
  'photo-1534528741775-53994a69daeb',
  'photo-1519011985187-444d62641929',
  'photo-1529626455594-4ff0802cfb7e',
  'photo-1503342217505-b0a15ec3261c',
  'photo-1494790108377-be9c29b29330',
  'photo-1515886657613-9f3515b0c78f',
  'photo-1529139513466-470460969242',
  'photo-1531746020798-e7953eeadff0',
];

const MOCK_PHOTOS: Photo[] = GALLERY_IDS.map((id, i) => ({
  id: String(i + 1),
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=800`,
  isLocked: i > 2
}));

const GalleryView: React.FC = () => {
  return (
    <div className="space-y-20 animate-in fade-in duration-1000 pb-32">
      <div className="text-center space-y-6">
        <h2 className="text-6xl font-serif italic text-white tracking-tighter">Visões Privadas</h2>
        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.5em] font-bold">A intimidade capturada em alta definição</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {MOCK_PHOTOS.map((photo) => (
          <div key={photo.id} className="relative aspect-[3/4] group overflow-hidden rounded-[2.5rem] bg-[#050505] border border-white/5 transition-all duration-700">
            {/* Imagem de fundo sempre um pouco visível para instigar */}
            <img 
              src={photo.url} 
              className={`w-full h-full object-cover transition-all duration-1000 ${
                photo.isLocked ? 'blur-sm scale-110 opacity-30 grayscale' : 'opacity-60 group-hover:opacity-100 group-hover:scale-105'
              }`} 
            />
            
            {photo.isLocked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-rose-950/5 backdrop-blur-[1px] hover:backdrop-blur-none transition-all duration-500 cursor-pointer group">
                <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4 bg-black/40 text-zinc-500 group-hover:text-rose-500 transition-colors">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
                </div>
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/40 group-hover:text-rose-500 transition-colors">Desbloquear</p>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end p-10">
                <button className="text-white text-[9px] font-bold uppercase tracking-[0.4em] flex items-center gap-3">
                   Explorar
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryView;
