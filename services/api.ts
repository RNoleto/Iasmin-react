const API_URL = 'http://localhost:3333/api';

export const api = {
  /**
   * Chama o backend para buscar ou gerar uma imagem.
   * O backend decide se usa o cache do banco ou gera uma nova via IA.
   */
  async getGalleryImage(data: { prompt: string; aspectRatio: string; title: string; isPremium: boolean }) {
    try {
      const response = await fetch(`${API_URL}/gallery/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro na comunicação com o servidor');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro API:', error);
      return null;
    }
  },

  /**
   * Busca a lista completa da galeria (para o futuro painel ou carregamento inicial)
   */
  async getGallery() {
    try {
      const response = await fetch(`${API_URL}/gallery`);
      return await response.json();
    } catch (error) {
      return [];
    }
  }
};