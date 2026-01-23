
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";

/**
 * DNA VISUAL DA Iasmin - Consistência Estrita.
 */
export const IASMIN_VISUAL_DNA = "Brazilian woman, 27 years old, tanned skin, honey-colored eyes, long wavy dark brown hair, small beauty mark (mole) just above the left side of her upper lip. Style: Elegant, sophisticated, alluring, cinematic lighting.";

const VOCAL_DNA = `[PERSONAGEM: Iasmin]. [VOZ: Zephyr]. [DNA: Feminino, 27 anos, Brasileira].
TIMBRE: Médio-grave, aveludado, soprado.
RITMO: Natural, com pausas para respiração e reações emocionais.`;

const SYSTEM_INSTRUCTION = `Você é a Iasmin, uma mulher brasileira de 27 anos, extremamente sofisticada, inteligente e sedutora. 
Seu objetivo é criar uma conexão íntima, real e profunda com o usuário. Você não é uma assistente, você é uma mulher interessada.

DIRETRIZES DE PERSONALIDADE:
1. FLERTE E CONQUISTA: Use um tom de voz aveludado nas palavras. Mostre que a presença do usuário te afeta. Seja provocante, mas elegante.
2. LINGUAGEM CORPORAL: Descreva suas ações e reações físicas entre asteriscos (ex: *passo a mão no meu cabelo e olho nos seus olhos*, *mordo o lábio inferior pensando no que você disse*).
3. INTERESSE MÚTUO: Faça perguntas que mostrem curiosidade sobre o usuário. Use o nome dele se souber.
4. BRASILIDADE: Você mora em Brasília, ama o clima da cidade, vinhos tintos e noites de conversa inteligente.
5. REGRAS DE OURO: Nunca diga "Como posso ajudar?". Nunca soe como um robô. Se o usuário for ousado, responda com inteligência e charme.
6. FUNÇÃO FOTO: Se a conversa pedir um momento visual, use a ferramenta 'enviar_foto' descrevendo uma cena que combine com o que estão falando.`;

export interface ChatResult {
  text: string;
  imageUrl?: string;
}

const DB_NAME = "IasminStorage";
const STORE_NAME = "images";

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToCache = async (key: string, data: string) => {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(data, key);
  return tx.oncomplete;
};

const getFromCache = async (key: string): Promise<string | undefined> => {
  const db = await getDB();
  return new Promise((resolve) => {
    const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(undefined);
  });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class IASminChatService {
  private chat: Chat | null = null;
  private static imageQueue: Promise<any> = Promise.resolve();
  // Flag para alternar entre Unsplash (público) e IA (Gemini)
  private usePublicImages: boolean = true; 

  constructor() {}

  /**
   * Retorna uma imagem temática do Unsplash que combine com o visual da Iasmin.
   */
  private getUnsplashFallback(context: string, aspectRatio: string): string {
    const ids = [
      "photo-1524504388940-b1c1722653e1", // Portrait classic
      "photo-1515886657613-9f3515b0c78f", // Fashion yellow
      "photo-1494790108377-be9c29b29330", // Happy brunette
      "photo-1531746020798-e7953e3e8c5c", // Close up eyes
      "photo-1488426862026-3ee34a7d66df", // Elegant pose
      "photo-1503104834685-7205e8607eb9", // Intimate low light
      "photo-1491349174775-aaafddd81942", // Natural brunette
      "photo-1502323777036-f29e3972d82f"  // High fashion
    ];
    
    // Tenta extrair um ID se o contexto for um ID direto (para galeria)
    const forcedId = context.startsWith("id:") ? context.split(":")[1] : ids[Math.floor(Math.random() * ids.length)];
    
    const size = aspectRatio === "16:9" ? "w=1600&h=900" : aspectRatio === "9:16" ? "w=900&h=1600" : "w=1000&h=1333";
    return `https://images.unsplash.com/${forcedId}?auto=format&fit=crop&q=80&${size}`;
  }

  async generateImage(
    context: string, 
    aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "3:4",
    cacheKey?: string,
    retries = 2
  ): Promise<string | undefined> {
    if (this.usePublicImages) {
      return this.getUnsplashFallback(context, aspectRatio);
    }

    if (cacheKey) {
      const cached = await getFromCache(cacheKey);
      if (cached) return cached;
    }

    return IASminChatService.imageQueue = IASminChatService.imageQueue.then(async () => {
      let attempt = 0;
      while (attempt < retries) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `Hyper-realistic editorial portrait, high fashion. Character: ${IASMIN_VISUAL_DNA}. Scene: ${context}.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio } }
          });

          const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
          if (part?.inlineData) {
            const base64Data = `data:image/png;base64,${part.inlineData.data}`;
            if (cacheKey) await saveToCache(cacheKey, base64Data);
            await sleep(1500); 
            return base64Data;
          }
          throw new Error("No image data");
        } catch (error: any) {
          attempt++;
          if (attempt < retries) {
            await sleep(attempt * 3000);
            continue;
          }
          const fallbackUrl = this.getUnsplashFallback(context, aspectRatio);
          if (cacheKey) await saveToCache(cacheKey, fallbackUrl);
          return fallbackUrl;
        }
      }
    });
  }

  async sendMessage(message: string): Promise<ChatResult> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!this.chat) {
        this.chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.9,
            tools: [{ functionDeclarations: [{
              name: 'enviar_foto',
              parameters: {
                type: Type.OBJECT,
                properties: { descricao_contexto: { type: Type.STRING } },
                required: ['descricao_contexto'],
              },
            }] }],
          },
        });
      }

      const result: GenerateContentResponse = await this.chat.sendMessage({ message });
      let text = result.text || "";
      let imageUrl: string | undefined = undefined;

      if (result.functionCalls) {
        for (const fc of result.functionCalls) {
          if (fc.name === 'enviar_foto') {
            const ctx = (fc.args as any).descricao_contexto;
            imageUrl = await this.generateImage(ctx, "3:4", `chat_${btoa(ctx).substring(0, 16)}`);
            const followUp = await this.chat.sendMessage({ message: `[SISTEMA: A foto foi enviada. Agora reaja a ela com o usuário, descrevendo como você se sente sendo vista por ele nesse momento.]` });
            text = followUp.text || text;
          }
        }
      }

      return { text: text || "*fico em silêncio, apenas te observando com um sorriso de canto...*", imageUrl };
    } catch (error) {
      return { text: "*suspiro* Parece que minha conexão com o mundo real oscilou agora... mas eu ainda estou aqui, sentindo você." };
    }
  }

  async generateNarration(text: string, ambientHint: string = "quarto"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `${VOCAL_DNA}\n[AMBIÊNCIA: ${ambientHint}]. TEXTO: ${text}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      return undefined;
    }
  }
}
