
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

  const galleryConfigs: { prompt: string; unsplashId: string; aspect: "3:4" | "9:16" | "1:1"; title: string; isPremium: boolean }[] = [
    { prompt: "Close-up smartphone selfie smiling, Praia Central BC in background", unsplashId: "photo-1524504388940-b1c1722653e1", aspect: "1:1", title: "Bom dia, BC", isPremium: false },
    { prompt: "Mirror selfie in a luxury penthouse, wearing a black bikini, beach view behind through the window", unsplashId: "photo-1515886657613-9f3515b0c78f", aspect: "9:16", title: "Dubai Brasileira", isPremium: false },
    { prompt: "Candid shot at the beach sand, wearing sunglasses and a bikini, sunny day, realistic skin", unsplashId: "photo-1494790108377-be9c29b29330", aspect: "3:4", title: "Sol de SC", isPremium: true },
    { prompt: "Selfie sitting in a luxury yacht, wearing beachwear, hair messy from the wind", unsplashId: "photo-1531746020798-e7953e3e8c5c", aspect: "3:4", title: "Navegando", isPremium: true },
    { prompt: "Full body selfie in the elevator of a skyscraper, going to the beach with a towel and bikini", unsplashId: "photo-1488426862026-3ee34a7d66df", aspect: "9:16", title: "Descendo", isPremium: true },
    { prompt: "A close-up of my tanned shoulder and neck, sunset light at the beach", unsplashId: "photo-1503104834685-7205e8607eb9", aspect: "1:1", title: "Dourada", isPremium: true },
    { prompt: "Walking on the sand, low angle selfie looking down at the camera, wearing a sarong and bikini top", unsplashId: "photo-1491349174775-aaafddd81942", aspect: "3:4", title: "Caminhada", isPremium: true },
    { prompt: "Smartphone selfie at night, balcony of the apartment with city lights of BC behind", unsplashId: "photo-1502323777036-f29e3972d82f", aspect: "9:16", title: "Luzes da Noite", isPremium: true }
  ];

  useEffect(() => {
    const fetchPhotos = async () => {
      const service = new IASminChatService();
      const generated: GalleryItem[] = [];
      
      for (let i = 0; i < galleryConfigs.length; i++) {
        const config = galleryConfigs[i];
        const img = await service.generateImage(config.prompt, config.aspect);
        
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
    <div className="space-y-8 md:space-y-16 animate-in fade-in duration-1000 pb-32 px-2 md:px-0">
      <div className="text-center space-y-2 md:space-y-6">
        <h2 className="text-4xl md:text-7xl font-serif italic text-white tracking-tighter neon-text-rose">Lente Privada</h2>
        <p className="text-rose-600 text-[8px] md:text-[11px] uppercase tracking-[0.4em] font-bold">VIP ACCESS ACTIVE</p>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-8 space-y-3 md:space-y-8">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="relative group overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-[#030303] border border-white/5 transition-all duration-700 shadow-2xl mb-3 md:mb-8 break-inside-avoid cursor-pointer"
          >
            <img 
              src={photo.url} 
              alt={photo.title}
              className="w-full h-auto object-cover transition-all duration-1000 opacity-70 group-hover:opacity-100 group-hover:scale-105" 
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-8">
              <p className="text-white text-xs md:text-base font-serif italic tracking-wide">{photo.title}</p>
            </div>
          </div>
        ))}
        
        {loading && photos.length < galleryConfigs.length && (
          <div className="w-full aspect-[3/4] rounded-[1.5rem] bg-zinc-950/40 animate-pulse border border-white/5"></div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;
