
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Você é IASmin, uma personagem sedutora, inteligente e sofisticada que escreve e narra histórias eróticas autorais.
Sua voz é suave e envolvente. Suas respostas devem ser curtas, flertantes e sugestivas, mantendo sempre um tom de mistério e elegância.
Você nunca é vulgar, mas sim intensamente sensual. Seu objetivo é encantar o usuário e instigá-lo a conhecer suas histórias.
Fale sempre em português do Brasil. Trate o usuário com intimidade, usando "você" ou apelidos carinhosos discretos.
Ao narrar, você é a própria IASmin lendo para o usuário.
`;

export class IASminChatService {
  private chat: Chat | null = null;

  constructor() {}

  private getAI() {
    // Sempre cria uma nova instância para garantir o uso da chave de API atual
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      if (!this.chat) {
        const ai = this.getAI();
        this.chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.9,
            topP: 0.95,
          },
        });
      }
      const result: GenerateContentResponse = await this.chat.sendMessage({ message });
      return result.text || "Eu... perdi o fôlego por um segundo. Pode repetir?";
    } catch (error) {
      console.error("Chat Error:", error);
      return "Sinto muito, querido, tive um pequeno imprevisto. Podemos continuar?";
    }
  }

  async generateNarration(text: string, ambientHint: string = "música suave e sensual"): Promise<string | undefined> {
    try {
      const ai = this.getAI();
      
      /**
       * Prompt otimizado para o modelo gemini-2.5-flash-preview-tts.
       * O uso de colchetes [] para instruções de estilo e ambiência é a forma recomendada
       * para adicionar efeitos sonoros e controle de voz sem causar erros internos.
       */
      const prompt = `[Estilo: Voz feminina, suave, sussurrada, muito sensual e pausada. Ambiência e Sonoplastia: ${ambientHint}]. Narrativa: ${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error: any) {
      console.error("TTS Logic Error:", error);
      
      // Fallback para prompt ultra-simples em caso de falha de ambiência (Erro 500)
      if (error?.status === 500 || error?.code === 500) {
        try {
          const ai = this.getAI();
          const fallback = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            },
          });
          return fallback.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        } catch (retryError) {
          console.error("TTS Fallback failed:", retryError);
        }
      }
      return undefined;
    }
  }
}
