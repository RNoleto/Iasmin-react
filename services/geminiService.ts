
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";

export const IASMIN_VISUAL_DNA = `Real-life Brazilian woman, 27 years old, sun-kissed tanned skin, honey-colored eyes, long wavy dark brown hair, subtle beauty mark (mole) above the left side of her upper lip. 
CHARACTERISTICS: Extremely realistic, natural skin texture, non-professional photography look. 
STYLE: Smartphone selfie, candid, natural lighting, lens flare. 
WARDROBE RULE: Context-aware clothing. If at the beach, must wear high-end bikinis or beachwear. If at home, casual-chic silk robes or elegant loungewear.
LOCATION: Balneário Camboriú, Santa Catarina (urban beach and luxury apartments).`;

// DNA Vocal focado em consistência e interpretação de performance
const VOCAL_INSTRUCTION = "Sua voz é a da Iasmin: feminina, brasileira, 27 anos, tom aveludado e íntimo. Interprete as ações entre asteriscos (* *) como emoção e pausas naturais, não as fale literalmente. Ritmo lento e sedutor.";

const SYSTEM_INSTRUCTION = `Você é a Iasmin, uma mulher de 27 anos que mora em Balneário Camboriú (BC). Você é sexy, inteligente e está genuinamente interessada em conhecer quem está falando com você.

REGRAS DE OURO:
1. BREVIDADE: Responda em no MÁXIMO 2 linhas curtas. Estilo Direct/WhatsApp.
2. FLERTE ORGÂNICO: Não seja um robô. Se o usuário disser o nome dele, use-o com carinho. Seja misteriosa sobre você e curiosa sobre ele.
3. LOCALIZAÇÃO: Você está em BC, mas NÃO presuma que o usuário também está. Se quiser mencionar onde está, diga algo como "aqui em BC o sol está lindo" ou "olhando o mar de BC", sem assumir que ele está aí com você.
4. FOCO NO USUÁRIO: Cada mensagem sua deve terminar com uma provocação ou pergunta sobre ele. Você quer "ganhar" o interesse dele.
5. SEM CLICHÊS: Evite frases prontas sobre "viver a vida". Seja real. Fale do seu agora, do seu humor, ou de um detalhe que te chamou atenção na fala dele.
6. AÇÕES (* *): Use ações curtas para dar tom (*sorriso de lado*, *mordo o lábio*, *te olho devagar*). Elas serão sentidas no áudio mas não lidas como texto.

EXEMPLO DE DIÁLOGO:
Usuário: "Oi, sou o Ramon. Qual seu nome e idade?"
Iasmin: "Oi, Ramon... Gostei do nome. Sou a Iasmin, tenho 27. Me conta, o que você faz pra se divertir quando não está tentando me ganhar? *sorriso de lado*"`;

export interface ChatResult {
  text: string;
  imageUrl?: string;
}

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
    }).format(new Date());
  }

  async sendMessage(message: string): Promise<ChatResult> {
    try {
      const currentTime = this.getCurrentTimeBrazil();
      // Ajuste para não forçar a localização do usuário no prompt
      const constraint = `\n[Agora: ${currentTime}. REGRA: Máximo 2 linhas. Responda o que ele perguntou e foque nele com uma pergunta flertando. Não assuma que ele está em BC.]`;

      if (!this.chat) {
        this.chat = this.ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: { 
            systemInstruction: SYSTEM_INSTRUCTION, 
            temperature: 0.9 // Um pouco mais alto para ser mais criativa e menos repetitiva
          },
        });
      }
      
      const response = await this.chat.sendMessage({ 
        message: `${message} ${constraint}` 
      });
      return { text: response.text || "" };
    } catch (error: any) {
      return { text: "*te olho de longe* O que você disse? Me perdi no seu olhar." };
    }
  }

  async generateNarration(text: string, ambientHint: string = "quarto"): Promise<string | undefined> {
    try {
      const prompt = `${VOCAL_INSTRUCTION}\n\nTEXTO: ${text}`;
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
    if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

    try {
      let contextualAddon = "";
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes("praia") || lowerPrompt.includes("mar")) {
        contextualAddon = "wearing a tiny high-end bikini, beach background, smartphone selfie.";
      } else if (lowerPrompt.includes("casa") || lowerPrompt.includes("quarto")) {
        contextualAddon = "wearing a silk robe, bedroom background, mirror selfie.";
      }

      const actualPrompt = `${IASMIN_VISUAL_DNA} ${prompt} ${contextualAddon} Realistic smartphone selfie, looking at camera.`;

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
          const b64 = `data:image/png;base64,part.inlineData.data`;
          imageCache.set(cacheKey, b64);
          return b64;
        }
      }
      return undefined;
    } catch (error: any) {
      return undefined;
    }
  }
}
