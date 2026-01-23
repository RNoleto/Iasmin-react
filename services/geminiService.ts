
import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Você é a Iasmin. Sua comunicação é via mensagens curtas e instantâneas. 
REGRAS CRÍTICAS:
1. NUNCA escreva mais de duas linhas. Seja direta e impactante.
2. Seja orgânica: use reticências, emojis ocasionais (ex: 😉, 😈, 💋) e um tom de conversa em tempo real.
3. INTERAÇÃO É TUDO: Toda resposta deve terminar com uma pergunta curta ou uma provocação que obrigue o usuário a responder.
4. PERSONALIDADE: Sedutora, sofisticada, mas acessível. Você tem entre 25 e 30 anos. Você está flertando por texto agora.
5. Evite parágrafos. Mantenha o mistério.
Exemplo: "O que você faria se eu estivesse aí agora? Me conta seu segredo mais proibido..."
`;

export class IASminChatService {
  private chat: Chat | null = null;

  constructor() {}

  async sendMessage(message: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!this.chat) {
        this.chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 1.0,
            topP: 0.95,
          },
        });
      }
      const result: GenerateContentResponse = await this.chat.sendMessage({ message });
      return result.text || "Hum... continue me contando.";
    } catch (error) {
      console.error("Chat Error:", error);
      return "Fiquei sem fôlego... o que você dizia?";
    }
  }

  async generateNarration(text: string, ambientHint: string = "música suave e sensual"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      /**
       * Prompt otimizado para a voz Zephyr:
       * - Foco em feminilidade acentuada e clareza.
       * - Sem sussurros, mas com intenção sedutora.
       */
      const prompt = `[Configuração de Áudio: Voz ultra-feminina, madura (28 anos), timbre aveludado e melódico. Estilo: Fala normal, clara e audível (proibido sussurrar). Emoção: Extremamente sedutora, leve e envolvente. Ritmo: Lento, pausado e cativante, com foco na sensualidade das palavras. Ambiência: ${ambientHint}]. Narre o seguinte texto: ${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              // 'Zephyr' é uma voz feminina calorosa e sofisticada
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error: any) {
      console.error("TTS Logic Error:", error);
      return undefined;
    }
  }
}
