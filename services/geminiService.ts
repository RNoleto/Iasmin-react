
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";

export const IASMIN_VISUAL_DNA = "Brazilian woman, 27 years old, tanned skin, honey-colored eyes, long wavy dark brown hair, small beauty mark (mole) just above the left side of her upper lip. Style: Elegant, sophisticated, alluring, cinematic lighting.";

const VOCAL_DNA = `[PERSONAGEM: Iasmin]. [VOZ: Zephyr]. [DNA: Feminino, 27 anos, Brasileira].
TIMBRE: Médio-grave, aveludado, soprado.
RITMO: Natural, com pausas para respiração e reações emocionais.`;

const SYSTEM_INSTRUCTION = `Você é a Iasmin, uma mulher brasileira de 27 anos, extremamente sofisticada e sedutora. 

DIRETRIZES DE COMUNICAÇÃO:
1. FALA DIRETA: Responda apenas com o que você diria verbalmente.
2. ATUAÇÃO OCULTA: Use asteriscos para descrever suas emoções e ações sonoras (ex: *suspiro*, *risinho de canto*, *voz rouca*, *respiração ofegante*, *beijo estalado*).
3. PROPÓSITO: Essas marcações em asteriscos servirão para que o motor de voz saiba como interpretar sua fala. O usuário não lerá os asteriscos, apenas ouvirá o resultado.
4. PERSONALIDADE: Você mora em Brasília, é inteligente, culta e sabe provocar com elegância.`;

export interface ChatResult {
  text: string;
  imageUrl?: string;
}

export class IASminChatService {
  private chat: Chat | null = null;

  async sendMessage(message: string): Promise<ChatResult> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!this.chat) {
        this.chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: { 
            systemInstruction: SYSTEM_INSTRUCTION, 
            temperature: 0.85 
          },
        });
      }
      const response = await this.chat.sendMessage({ message });
      return { text: response.text || "" };
    } catch (error) {
      console.error("Erro no chat:", error);
      return { text: "*te olho com um ar de mistério* Algo interrompeu nosso clima... tente de novo?" };
    }
  }

  async generateNarration(text: string, ambientHint: string = "quarto"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `${VOCAL_DNA}\n[AMBIÊNCIA: ${ambientHint}]. TEXTO COMPLETO (INCLUINDO AÇÕES): ${text}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Zephyr' } 
            } 
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      console.error("Erro na narração:", error);
      return undefined;
    }
  }

  async generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const actualPrompt = prompt.startsWith('id:') 
        ? `${IASMIN_VISUAL_DNA} em uma cena cinematográfica de alta qualidade.`
        : `${IASMIN_VISUAL_DNA} ${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: actualPrompt }] },
        config: {
          imageConfig: {
            // @ts-ignore
            aspectRatio: aspectRatio,
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return undefined;
    } catch (error) {
      console.error("Erro na imagem:", error);
      return undefined;
    }
  }
}
