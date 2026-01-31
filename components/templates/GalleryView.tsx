import React, { useState, useEffect } from 'react';
import { Photo, View, SubscriptionLevel } from '../../types';
import { api } from '../../services/api'; // <--- Importamos nosso novo serviço

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

  // CONFIGURAÇÃO SINCRONIZADA COM O BANCO DE DADOS
  const galleryConfigs: { prompt: string; unsplashId: string; aspect: "3:4" | "9:16" | "1:1"; title: string; isPremium: boolean }[] = [
    { 
      title: "Calçadão BC",
      prompt: "Full body candid shot, walking on a beach boardwalk in Balneário Camboriú. She is looking away from the camera, adjusting her hair, wearing a stylish white beach cover-up and sunglasses. windy day, movement blur, urban beach background.", 
      unsplashId: "ignore", aspect: "1:1", isPremium: false 
    },
    { 
      title: "Manhã Leve",
      prompt: "Sitting on a messy white bed in a luxury hotel room, holding a cup of coffee. She is wearing a silk robe, looking out the window at the ocean view. Side profile, soft morning light, cozy atmosphere. Not looking at the camera.", 
      unsplashId: "ignore", aspect: "1:1", isPremium: true 
    },
    { 
      title: "Indo pra Praia",
      prompt: "Sitting in the driver's seat of a luxury car (beige leather interior). One hand on the steering wheel, the other adjusting the rearview mirror. Sunlight flaring through the window. Candid, slightly from the side. Wearing oversized sunglasses.", 
      unsplashId: "ignore", aspect: "1:1", isPremium: true 
    },
    { 
      title: "Infinity View",
      prompt: "Rear view (from behind), resting on the edge of a rooftop infinity pool. Looking at the city skyline. Wet hair slicked back. Wearing a bikini. Focus on the back and the view, blurry city lights in the background. Sunset hour.", 
      unsplashId: "ignore", aspect: "1:1", isPremium: true 
    },
    { 
      title: "Alto Mar",
      prompt: "Selfie sitting in a luxury yacht, wearing beachwear, hair messy from the wind. Smiling, ocean background.", 
      unsplashId: "ignore", aspect: "1:1", isPremium: true 
    },
    { 
      title: "Luzes da Cidade",
      prompt: "Smartphone selfie at night, balcony of the apartment with city lights of BC behind. Wearing elegant black loungewear.", 
      unsplashId: "ignore", aspect: "1:1", isPremium: true 
    },
    { 
        title: "Antes de Sair",
        prompt: "Mirror selfie in a luxury penthouse, wearing a black bikini, beach view behind through the window.", 
        unsplashId: "ignore", aspect: "1:1", isPremium: false 
    }
  ];

  useEffect(() => {
    const fetchPhotos = async () => {
      const generated: GalleryItem[] = [];
      
      // Agora chamamos o Backend para cada configuração
      for (let i = 0; i < galleryConfigs.length; i++) {
        const config = galleryConfigs[i];
        
        // Chamada ao Backend (que vai checar o banco ou gerar no Gemini)
        const response = await api.getGalleryImage({
            prompt: config.prompt,
            aspectRatio: config.aspect,
            title: config.title,
            isPremium: config.isPremium
        });
        
        // Se o backend retornou uma imagem válida
        if (response && response.imageUrl) {
          generated.push({
            id: response.id || String(i + 1),
            url: response.imageUrl, // URL local (http://localhost:3333/uploads/...)
            isLocked: false,
            aspect: config.aspect,
            title: response.title,
            isPremium: response.isPremium
          });
          // Atualiza a tela a cada foto que chega (efeito progressivo)
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
              loading="lazy"
              className="w-full h-auto object-cover transition-all duration-1000 opacity-70 group-hover:opacity-100 group-hover:scale-105" 
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-8">
              <p className="text-white text-xs md:text-base font-serif italic tracking-wide">{photo.title}</p>
            </div>
          </div>
        ))}
        
        {loading && photos.length < galleryConfigs.length && (
          <div className="w-full aspect-[3/4] rounded-[1.5rem] bg-zinc-950/40 animate-pulse border border-white/5 flex items-center justify-center">
             <span className="text-rose-500 text-xs tracking-widest uppercase animate-bounce">Carregando...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;