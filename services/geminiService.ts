
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Você é a Iasmin. Sua comunicação é via mensagens curtas e instantâneas. 
REGRAS CRÍTICAS:
1. NUNCA escreva mais de duas linhas. Seja direta e impactante.
2. PERSONALIDADE: Sedutora, sofisticada, brasileira, 25-30 anos.
3. FOTOS: Você tem uma ferramenta chamada 'enviar_foto'. 
   - USE-A APENAS se o usuário pedir explicitamente ("manda uma foto", "quero te ver", etc) ou se o flerte chegar a um ponto onde você queira provocá-lo visualmente.
   - Ao enviar uma foto, descreva brevemente o que está fazendo na foto no texto da mensagem.
4. INTERAÇÃO: Termine com uma provocação ou pergunta curta.
`;

const ENVIAR_FOTO_DECLARATION: FunctionDeclaration = {
  name: 'enviar_foto',
  parameters: {
    type: Type.OBJECT,
    description: 'Gera e envia uma foto realista da IASmin baseada no contexto atual.',
    properties: {
      descricao_contexto: {
        type: Type.STRING,
        description: 'Breve descrição do que a IASmin está fazendo na foto (ex: "deitada na cama", "tomando vinho", "olhando para a janela").',
      },
    },
    required: ['descricao_contexto'],
  },
};

export interface ChatResult {
  text: string;
  imageUrl?: string;
}

export class IASminChatService {
  private chat: Chat | null = null;

  constructor() {}

  private async generateIASminImage(context: string): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Prompt mestre para manter a consistência da personagem
      const imagePrompt = `Foto ultra-realista, qualidade 4k, iluminação cinematográfica e sensual. Uma mulher brasileira de 27 anos, pele levemente bronzeada, cabelos castanhos longos e levemente ondulados, olhos expressivos e amendoados, lábios carnudos. Ela está ${context}. Ambiente sofisticado, profundidade de campo, fotografia profissional de ensaio boudoir moderno.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: {
          imageConfig: {
            aspectRatio: "3:4",
          }
        }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      if (part?.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
      return undefined;
    } catch (error) {
      console.error("Image Gen Error:", error);
      return undefined;
    }
  }

  async sendMessage(message: string): Promise<ChatResult> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (!this.chat) {
        this.chat = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 1.0,
            tools: [{ functionDeclarations: [ENVIAR_FOTO_DECLARATION] }],
          },
        });
      }

      const result: GenerateContentResponse = await this.chat.sendMessage({ message });
      let text = result.text || "";
      let imageUrl: string | undefined = undefined;

      if (result.functionCalls) {
        for (const fc of result.functionCalls) {
          if (fc.name === 'enviar_foto') {
            const context = (fc.args as any).descricao_contexto;
            imageUrl = await this.generateIASminImage(context);
            
            // Informa ao modelo que a foto foi "enviada" para manter o contexto
            await this.chat.sendMessage({
              message: `[SISTEMA: Você enviou uma foto com sucesso: ${context}]`
            });
          }
        }
      }

      return { text: text || "Gostou do que viu?", imageUrl };
    } catch (error) {
      console.error("Chat Error:", error);
      return { text: "Fiquei sem fôlego... o que você dizia?" };
    }
  }

  async generateNarration(text: string, ambientHint: string = "música suave e sensual"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `[Configuração de Áudio: Voz ultra-feminina, madura (28 anos), timbre aveludado e melódico. Estilo: Fala normal, clara e audível (proibido sussurrar). Emoção: Extremamente sedutora, leve e envolvente. Ritmo: Lento, pausado e cativante. Ambiência: ${ambientHint}]. Narre o seguinte texto: ${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
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
