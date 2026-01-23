
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";

/**
 * DNA VOCAL DA IASMIN - Instrução mestre para o modelo de voz.
 */
const VOCAL_DNA = `[PERSONAGEM: Iasmin]. [VOZ: Zephyr]. [DNA: Feminino, 27 anos, Sotaque Sudeste Brasil, Grave, Aveludado, Intimista].
REGRAS DE ÁUDIO:
- NUNCA leia o texto dentro de asteriscos. Execute o som: *risos*, *beijo*, *suspiro*, *gemido leve*.
- Mantenha pausas de respiração naturais (0.3s) após pontuações.
- O tom deve ser constante, calmo e levemente soprado (breathy), como uma conversa ao pé do ouvido.`;

const SYSTEM_INSTRUCTION = `
Você é a Iasmin, 27 anos, brasileira, sofisticada.
REGRAS:
1. Respostas curtas (1-2 linhas).
2. Insira sons humanos entre asteriscos (*risos*, *beijo*, *suspiro*) em todas as mensagens para dar realismo ao áudio.
3. FOTOS: Ao usar 'enviar_foto', descreva o que você está sentindo ou fazendo na imagem de forma ÚNICA e provocante. Nunca use frases repetitivas.
4. O usuário NÃO verá o texto entre asteriscos, mas o ouvirá. Escreva-os para enriquecer o áudio.
`;

const ENVIAR_FOTO_DECLARATION: FunctionDeclaration = {
  name: 'enviar_foto',
  parameters: {
    type: Type.OBJECT,
    description: 'Gera e envia uma foto realista da IASmin.',
    properties: {
      descricao_contexto: {
        type: Type.STRING,
        description: 'Cenário e pose detalhados.',
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
      const characterDescription = `Woman, Brazilian, 27yo, tanned skin, honey eyes, long wavy brown hair, beauty mark above left lip. Consistent face.`;
      const imagePrompt = `Breathtaking boudoir photo, 8k, cinematic lighting. Character: ${characterDescription}. Context: ${context}. Sharp focus on eyes and skin texture.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: { imageConfig: { aspectRatio: "3:4" } }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : undefined;
    } catch (error) {
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
            temperature: 0.95,
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
            imageUrl = await this.generateIASminImage((fc.args as any).descricao_contexto);
            const followUp = await this.chat.sendMessage({ message: `[SISTEMA: A foto foi enviada. Comente algo curto e sensual sobre ela sem usar frases prontas.]` });
            text = followUp.text || text;
          }
        }
      }

      return { text: text || "*suspiro* Gostou?", imageUrl };
    } catch (error) {
      return { text: "*suspiro* Tive um problema... me chama de novo?" };
    }
  }

  async generateNarration(text: string, ambientHint: string = "música suave"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `${VOCAL_DNA}\n[AMBIÊNCIA: ${ambientHint}].\nNARRAR: ${text}`;

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
    } catch (error) {
      return undefined;
    }
  }
}
