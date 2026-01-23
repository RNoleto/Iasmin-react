
import React from 'react';
import { Photo } from '../../types';

const MOCK_PHOTOS: Photo[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  url: `https://picsum.photos/id/${100 + i}/600/800`,
  isLocked: i > 2
}));

const GalleryView: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif italic text-white">Galeria Privada</h2>
        <p className="text-zinc-500 max-w-lg mx-auto">Momentos de intimidade capturados em alta definição. <br />Alguns segredos são revelados apenas a assinantes.</p>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {MOCK_PHOTOS.map((photo) => (
          <div key={photo.id} className="relative group overflow-hidden rounded-xl bg-zinc-900 border border-white/5">
            <img 
              src={photo.url} 
              alt="IASmin photo" 
              className={`w-full h-auto object-cover transition-all duration-700 ${photo.isLocked ? 'blur-2xl grayscale brightness-50' : 'group-hover:scale-105'}`}
            />
            
            {photo.isLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 mb-3">
                  🔒
                </div>
                <p className="text-xs font-bold uppercase tracking-tighter text-white">Assine para Desbloquear</p>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
               {!photo.isLocked && <button className="text-white text-xs font-medium">Ver em HD →</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryView;
