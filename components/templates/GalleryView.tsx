
import React from 'react';
import { Photo } from '../../types';

const UNSPLASH_IDS = [
  'photo-1519011985187-444d62641929',
  'photo-1522845015757-50bce044e5da',
  'photo-1529139513466-470460969242',
  'photo-1515886657613-9f3515b0c78f',
  'photo-1531746020798-e7953eeadff0',
  'photo-1534528741775-53994a69daeb',
  'photo-1503342217505-b0a15ec3261c',
  'photo-1481824429379-07aa5e5b0739',
];

const MOCK_PHOTOS: Photo[] = UNSPLASH_IDS.map((id, i) => ({
  id: String(i + 1),
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=800`,
  isLocked: i > 2
}));

const GalleryView: React.FC = () => {
  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-serif italic text-white tracking-tight">Galeria Privada</h2>
        <div className="w-12 h-px bg-rose-900 mx-auto"></div>
        <p className="text-zinc-500 text-xs max-w-sm mx-auto uppercase tracking-[0.2em] font-bold">Visões exclusivas da minha intimidade</p>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6 px-4">
        {MOCK_PHOTOS.map((photo) => (
          <div key={photo.id} className="relative group overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-white/5 transition-all duration-700 hover:border-rose-900/40">
            <div className={`overflow-hidden transition-all duration-1000 ${photo.isLocked ? 'blur-md' : 'group-hover:scale-110'}`}>
              <img src={photo.url} className={`w-full h-auto object-cover opacity-80 ${photo.isLocked ? 'brightness-50' : 'group-hover:opacity-100'}`} />
            </div>
            
            {photo.isLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950/20 backdrop-blur-[2px] hover:bg-zinc-950/10 transition-colors duration-500 cursor-pointer">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 bg-black/40 backdrop-blur-md">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/80">Premium Access</p>
              </div>
            )}

            {!photo.isLocked && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
                <button className="text-white text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                   Ver em HD
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
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
