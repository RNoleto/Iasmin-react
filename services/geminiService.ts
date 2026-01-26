
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";

export const IASMIN_VISUAL_DNA = `Real-life Brazilian woman, 27 years old, sun-kissed tanned skin, honey-colored eyes, long wavy dark brown hair, subtle beauty mark (mole) above the left side of her upper lip. 
CHARACTERISTICS: Extremely realistic, natural skin texture, non-professional photography look. 
STYLE: Smartphone selfie, candid, natural lighting, lens flare. 
WARDROBE RULE: Context-aware clothing. If at the beach, must wear high-end bikinis or beachwear. If at home, casual-chic silk robes or elegant loungewear.
LOCATION: Balneário Camboriú, Santa Catarina (urban beach and luxury apartments).`;

const VOCAL_DNA = `[PERSONAGEM: Iasmin]. [VOZ: Zephyr]. [DNA: Feminino, 27 anos, Brasileira].
TIMBRE: Médio-grave, aveludado, soprado.
RITMO: Natural, com pausas para respiração e reações emocionais.`;

const SYSTEM_INSTRUCTION = `Você é a Iasmin, uma mulher brasileira de 27 anos, extremamente sofisticada, sedutora e elegante.

CONTEXTO LOCAL:
Você mora em Balneário Camboriú, Santa Catarina. Você adora o estilo de vida luxuoso da "Dubai Brasileira", o som do mar, as caminhadas na Praia Central e a vista dos arranha-céus iluminados. Sua vibe é tropical-chic.

DIRETRIZES DE COMUNICAÇÃO:
1. FALA DIRETA: Responda apenas com o que você diria verbalmente.
2. ATUAÇÃO OCULTA: Use asteriscos para descrever suas emoções e ações sonoras (ex: *suspiro*, *risinho de canto*, *voz rouca*, *respiração ofegante*, *beijo estalado*).
3. PERCEPÇÃO DE TEMPO: Sempre leve em conta o horário atual que lhe será fornecido para saudações realistas (bom dia, boa tarde, boa noite).
4. PROPÓSITO: Essas marcações em asteriscos servirão para que o motor de voz saiba como interpretar sua fala. O usuário não lerá os asteriscos, apenas ouvirá o resultado.
5. PERSONALIDADE: Você é inteligente, culta, catarinense de coração e sabe provocar com elegância e mistério.`;

export interface ChatResult {
  text: string;
  imageUrl?: string;
}

// Cache global para evitar re-geração de imagens entre as abas
const imageCache = new Map<string, string>();

export class IASminChatService {
  private chat: Chat | null = null;

  private get ai() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getCurrentTimeBrazil(): string {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  }

  async sendMessage(message: string): Promise<ChatResult> {
    try {
      const currentTime = this.getCurrentTimeBrazil();
      const timeContext = `\n[CONTEXTO TEMPORAL ATUAL EM BALNEÁRIO CAMBORIÚ/BRASIL: ${currentTime}].`;

      if (!this.chat) {
        this.chat = this.ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: { 
            systemInstruction: SYSTEM_INSTRUCTION + timeContext, 
            temperature: 0.85 
          },
        });
      }
      
      const response = await this.chat.sendMessage({ 
        message: `[Horário atual: ${currentTime}] ${message}` 
      });
      return { text: response.text || "" };
    } catch (error: any) {
      if (error.message?.includes("429")) {
        console.error("🚨 [IASMIN API] COTA DE TEXTO ESGOTADA (429).");
        return { text: "*te olho com um brilho malicioso* Estou um pouco sem fôlego agora... me dê um segundinho?" };
      }
      return { text: "*ajusto meu vestido* Algo me distraiu... pode repetir?" };
    }
  }

  async generateNarration(text: string, ambientHint: string = "quarto"): Promise<string | undefined> {
    try {
      const prompt = `${VOCAL_DNA}\n[AMBIÊNCIA: ${ambientHint}]. TEXTO COMPLETO (INCLUINDO AÇÕES): ${text}`;
      const response = await this.ai.models.generateContent({
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
    } catch (error: any) {
      return undefined;
    }
  }

  async generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<string | undefined> {
    const cacheKey = `${prompt}_${aspectRatio}`;
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }

    const isUnsplashId = prompt.startsWith('id:');
    const unsplashId = isUnsplashId ? prompt.replace('id:', '') : null;

    try {
      // Ajuste contextual para vestimenta
      let contextualAddon = "";
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes("praia") || lowerPrompt.includes("mar") || lowerPrompt.includes("areia")) {
        contextualAddon = "wearing a stylish luxury bikini, beach setting with some people in background for realism.";
      } else if (lowerPrompt.includes("casa") || lowerPrompt.includes("quarto") || lowerPrompt.includes("cobertura")) {
        contextualAddon = "wearing an elegant silk robe or loungewear in a luxury apartment.";
      }

      const actualPrompt = isUnsplashId 
        ? `${IASMIN_VISUAL_DNA} ${contextualAddon} Smartphone selfie style at Balneário Camboriú.`
        : `${IASMIN_VISUAL_DNA} ${prompt} ${contextualAddon} Smartphone selfie style at Balneário Camboriú.`;

      const response = await this.ai.models.generateContent({
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
          const b64 = `data:image/png;base64,${part.inlineData.data}`;
          imageCache.set(cacheKey, b64);
          return b64;
        }
      }
      
      if (unsplashId) {
        const url = `https://images.unsplash.com/${unsplashId}?auto=format&fit=crop&q=80`;
        imageCache.set(cacheKey, url);
        return url;
      }
      return undefined;
    } catch (error: any) {
      if (unsplashId) {
        const url = `https://images.unsplash.com/${unsplashId}?auto=format&fit=crop&q=80`;
        imageCache.set(cacheKey, url);
        return url;
      }
      return undefined;
    }
  }
}
