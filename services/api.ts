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
  },

  /**
   * Envia uma mensagem para a Iasmin e recebe a resposta.
   * Se o servidor estiver offline, retorna uma resposta local padrão.
   * @param message Mensagem do usuário
   * @param history Histórico de mensagens anteriores
   * @return Resposta da Iasmin
   */
  async sendMessage(message: string, history: string[] = []) {
    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const data = await response.json();
      return data.reply; // Retorna o texto da Iasmin
    } catch (error) {
      console.error('Erro Chat:', error);
      // Fallback local caso o servidor esteja offline
      return "O que você disse? Me perdi no seu olhar."; 
    }
  }
};