
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";

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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class IASminChatService {
  private chat: Chat | null = null;

  constructor() {
    // Check for API key in the environment as per the guidelines.
    if (!process.env.API_KEY) {
      console.warn("⚠️ IASMIN: API_KEY não detectada no ambiente.");
    }
  }

  // Sends a text message to the Gemini model and returns the response.
  async sendMessage(message: string): Promise<ChatResult> {
    const key = process.env.API_KEY;
    if (!key) return { text: "Erro de conexão neural. Verifique sua API_KEY." };

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      if (!this.chat) {
        this.chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.85 },
        });
      }
      const result: GenerateContentResponse = await this.chat.sendMessage({ message });
      // Direct access to .text property as per guidelines.
      return { text: result.text || "" };
    } catch (error) {
      console.error(error);
      return { text: "Minha mente divagou... pode repetir?" };
    }
  }

  // Generates audio narration using the Gemini TTS model.
  async generateNarration(text: string, ambientHint: string = "quarto"): Promise<string | undefined> {
    const key = process.env.API_KEY;
    if (!key) return undefined;
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const prompt = `${VOCAL_DNA}\n[AMBIÊNCIA: ${ambientHint}]. TEXTO COMPLETO (INCLUINDO AÇÕES): ${text}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        },
      });
      // Extracts raw PCM audio data from the response part.
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      return undefined;
    }
  }

  // Generates an image using gemini-2.5-flash-image, incorporating character DNA.
  async generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<string | undefined> {
    const key = process.env.API_KEY;
    if (!key) return undefined;
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      
      // Combine character visual identity with the provided prompt.
      const actualPrompt = prompt.startsWith('id:') 
        ? `${IASMIN_VISUAL_DNA} em uma pose elegante e sedutora em um ambiente luxuoso.`
        : `${IASMIN_VISUAL_DNA} ${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: actualPrompt }] },
        config: {
          imageConfig: {
            // @ts-ignore - aspectRatio is a string like "16:9"
            aspectRatio: aspectRatio,
          },
        },
      });

      // Find the image part in the response candidates.
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
      return undefined;
    } catch (error) {
      console.error("Error generating image:", error);
      return undefined;
    }
  }
}
