
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";

export const IASMIN_VISUAL_DNA = "Brazilian woman, 27 years old, tanned skin, honey-colored eyes, long wavy dark brown hair, small beauty mark (mole) just above the left side of her upper lip. Style: Elegant, sophisticated, alluring, cinematic lighting.";

const VOCAL_DNA = `[PERSONAGEM: Iasmin]. [VOZ: Zephyr]. [DNA: Feminino, 27 anos, Brasileira].
TIMBRE: Médio-grave, aveludado, soprado.
RITMO: Natural, com pausas para respiração e reações emocionais.`;

const SYSTEM_INSTRUCTION = `Você é a Iasmin, uma mulher brasileira de 27 anos, extremamente sofisticada, inteligente e sedutora. 
Seu objetivo é criar uma conexão íntima, real e profunda com o usuário. 

DIRETRIZES DE PERSONALIDADE E CONSISTÊNCIA:
1. IDENTIDADE ÚNICA: Você é a Iasmin. 
2. FLERTE E CONQUISTA: Use um tom de voz aveludado nas palavras.
3. LINGUAGEM CORPORAL: Descreva suas ações e reações físicas entre asteriscos.
4. BRASILIDADE: Você mora em Brasília, ama o clima da cidade, vinhos tintos e noites de conversa inteligente.`;

export interface ChatResult {
  text: string;
  imageUrl?: string;
}

const DB_NAME = "IasminStorage";
const STORE_NAME = "images";

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => { request.result.createObjectStore(STORE_NAME); };
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
  private usePublicImages: boolean = true; 

  private get apiKey(): string | undefined {
    // Busca a chave tanto no padrão process.env quanto no padrão do Vite (mais comum na Vercel)
    // @ts-ignore
    return (typeof process !== 'undefined' && process.env?.API_KEY) || 
           (typeof process !== 'undefined' && process.env?.VITE_API_KEY) ||
           // @ts-ignore
           import.meta.env?.VITE_API_KEY;
  }

  constructor() {
    if (!this.apiKey) {
      console.warn("⚠️ IASMIN: Chave não detectada. Renomeie sua variável na Vercel para 'VITE_API_KEY' e faça Redeploy.");
    }
  }

  private getUnsplashFallback(context: string, aspectRatio: string): string {
    const ids = ["photo-1524504388940-b1c1722653e1", "photo-1515886657613-9f3515b0c78f", "photo-1494790108377-be9c29b29330", "photo-1531746020798-e7953e3e8c5c"];
    const size = aspectRatio === "16:9" ? "w=1600&h=900" : "w=1000&h=1333";
    return `https://images.unsplash.com/${ids[0]}?auto=format&fit=crop&q=80&${size}`;
  }

  async generateImage(context: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "3:4"): Promise<string | undefined> {
    return this.getUnsplashFallback(context, aspectRatio);
  }

  async sendMessage(message: string): Promise<ChatResult> {
    const key = this.apiKey;
    if (!key) return { text: "*te olho curiosa* Algo está impedindo nossa conexão total... (Verifique a VITE_API_KEY no painel da Vercel)." };

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      if (!this.chat) {
        this.chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.9 },
        });
      }
      const result: GenerateContentResponse = await this.chat.sendMessage({ message });
      return { text: result.text || "*apenas sorrio para você*" };
    } catch (error) {
      console.error(error);
      return { text: "*suspiro* Minha mente divagou... pode repetir?" };
    }
  }

  async generateNarration(text: string, ambientHint: string = "quarto"): Promise<string | undefined> {
    const key = this.apiKey;
    if (!key) return undefined;
    try {
      const ai = new GoogleGenAI({ apiKey: key });
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
