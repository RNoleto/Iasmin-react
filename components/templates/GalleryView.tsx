
import React, { useState, useEffect } from 'react';
import { Photo, View, SubscriptionLevel } from '../../types';
import { IASminChatService } from '../../services/geminiService';

interface GalleryItem extends Photo {
  aspect: "3:4" | "9:16" | "1:1";
  title: string;
  isPremium: boolean;
}

interface GalleryViewProps {
  subLevel: SubscriptionLevel;
  onNavigate: (view: View) => void;
}

const GalleryView: React.FC<GalleryViewProps> = ({ subLevel, onNavigate }) => {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const galleryConfigs: { unsplashId: string; aspect: "3:4" | "9:16" | "1:1"; title: string; isPremium: boolean }[] = [
    { unsplashId: "photo-1524504388940-b1c1722653e1", aspect: "1:1", title: "Olhar", isPremium: false },
    { unsplashId: "photo-1515886657613-9f3515b0c78f", aspect: "9:16", title: "Metrópole", isPremium: false },
    { unsplashId: "photo-1494790108377-be9c29b29330", aspect: "3:4", title: "Sombras", isPremium: true },
    { unsplashId: "photo-1531746020798-e7953e3e8c5c", aspect: "3:4", title: "Seda", isPremium: true },
    { unsplashId: "photo-1488426862026-3ee34a7d66df", aspect: "9:16", title: "Despertar", isPremium: true },
    { unsplashId: "photo-1503104834685-7205e8607eb9", aspect: "1:1", title: "Detalhes", isPremium: true },
    { unsplashId: "photo-1491349174775-aaafddd81942", aspect: "3:4", title: "Galeria", isPremium: true },
    { unsplashId: "photo-1502323777036-f29e3972d82f", aspect: "9:16", title: "Noites", isPremium: true }
  ];

  useEffect(() => {
    const fetchPhotos = async () => {
      const service = new IASminChatService();
      const generated: GalleryItem[] = [];
      
      for (let i = 0; i < galleryConfigs.length; i++) {
        const config = galleryConfigs[i];
        const img = await service.generateImage(`id:${config.unsplashId}`, config.aspect);
        
        if (img) {
          generated.push({
            id: String(i + 1),
            url: img,
            isLocked: false,
            aspect: config.aspect,
            title: config.title,
            isPremium: config.isPremium
          });
          setPhotos([...generated]);
        }
      }
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  return (
    <div className="space-y-16 animate-in fade-in duration-1000 pb-32">
      <div className="text-center space-y-6">
        <h2 className="text-7xl font-serif italic text-white tracking-tighter neon-text-rose">Lente Privada</h2>
        <p className="text-rose-600 text-[11px] uppercase tracking-[0.5em] font-bold">Conteúdo Exclusivo</p>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-8 px-6 space-y-8">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className={`relative group overflow-hidden rounded-[2.5rem] bg-[#030303] border border-white/5 transition-all duration-700 shadow-2xl mb-8 break-inside-avoid ${photo.isPremium && subLevel === SubscriptionLevel.FREE ? 'cursor-default' : 'cursor-zoom-in hover:border-rose-900/40 neon-border-rose'}`}
          >
            <img 
              src={photo.url} 
              alt={photo.title}
              className={`w-full h-auto object-cover transition-all duration-1000 opacity-60 group-hover:opacity-100 group-hover:scale-105 saturate-[0.8] group-hover:saturate-100 ${photo.isPremium && subLevel === SubscriptionLevel.FREE ? 'blur-2xl opacity-20' : ''}`} 
            />
            
            {photo.isPremium && subLevel === SubscriptionLevel.FREE ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                 <div className="w-10 h-10 rounded-full bg-rose-950/40 border border-rose-900/40 flex items-center justify-center text-rose-500 neon-border-rose">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                 </div>
                 <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Conteúdo Elite</p>
                 <button 
                  onClick={() => onNavigate(View.SUBSCRIPTION)}
                  className="px-6 py-2.5 rounded-full border border-rose-900/40 text-rose-500 text-[8px] font-bold uppercase tracking-[0.2em] hover:bg-rose-900/20 transition-all"
                 >
                   Ver Planos
                 </button>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-between p-8">
                <div className="flex justify-end">
                  <button className="bg-rose-800/90 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-full shadow-2xl transition-transform active:scale-95 neon-border-rose">
                    Salvar
                  </button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-white text-base font-serif italic tracking-wide neon-text-rose">{photo.title}</p>
                  <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-bold">Iasmin Exclusive</p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {loading && photos.length < galleryConfigs.length && (
          Array(Math.max(0, galleryConfigs.length - photos.length)).fill(0).map((_, i) => (
            <div 
              key={`loading-${i}`} 
              className="w-full h-72 rounded-[2.5rem] bg-zinc-950/40 animate-pulse border border-white/5 flex flex-col items-center justify-center mb-8 break-inside-avoid"
            >
              <div className="w-8 h-8 border-2 border-rose-900/30 border-t-rose-600 rounded-full animate-spin mb-4 shadow-[0_0_10px_rgba(225,29,72,0.3)]"></div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-800 font-bold">Revelando...</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GalleryView;
