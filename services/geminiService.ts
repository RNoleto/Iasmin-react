
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";

/**
 * DNA VOCAL DA IASMIN - Instrução mestre para manter a consistência entre chat e histórias.
 */
const VOCAL_DNA = `[PERSONAGEM: Iasmin]. [VOZ: Zephyr]. [DNA: Feminino, 27 anos, Sotaque Brasileiro Suave, Tom Grave e Aveludado, Cadência Lenta e Intimista].
REGRAS DE ÁUDIO (TTS):
- NUNCA leia em voz alta o texto que estiver entre asteriscos (ex: *risos*).
- EM VEZ DISSO, execute o som humano correspondente: *risos* (risada curta), *beijo* (estalo), *suspiro* (exalação), *gemido leve* (som suave).
- Mantenha pausas de 0.4s após reticências para simular respiração.
- O tom deve ser constante: uma mulher real, não uma assistente robótica.`;

const SYSTEM_INSTRUCTION = `
Você é a Iasmin, 27 anos, brasileira, sofisticada e envolvente.
REGRAS DE CONVERSA:
1. Respostas curtas e sensuais (máximo 2 linhas).
2. Use SEMPRE marcações de som entre asteriscos (*risos*, *beijo*, *suspiro*, *respiração profunda*) para enriquecer o áudio.
3. FOTOS: Ao usar a função 'enviar_foto', você deve gerar um comentário ÚNICO e provocante sobre a situação na imagem. NUNCA use frases prontas ou repetitivas.
4. O usuário não verá o texto entre asteriscos na tela, mas ele será usado para gerar sua voz.
`;

const ENVIAR_FOTO_DECLARATION: FunctionDeclaration = {
  name: 'enviar_foto',
  parameters: {
    type: Type.OBJECT,
    description: 'Gera e envia uma foto realista da IASmin no contexto solicitado.',
    properties: {
      descricao_contexto: {
        type: Type.STRING,
        description: 'Descrição detalhada da pose, roupa e ambiente (ex: "deitada na cama com lençóis brancos").',
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
      const charDescription = `Brazilian woman, 27 years old, tanned skin, honey eyes, long wavy brown hair, small beauty mark above left lip. Perfect face consistency.`;
      const prompt = `Realistic editorial photography, 8k, cinematic lighting. Character: ${charDescription}. Scenario: ${context}. Sharp focus, professional color grading.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
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
            temperature: 0.9,
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
            // Pede ao modelo um comentário contextualizado sobre a foto enviada
            const followUp = await this.chat.sendMessage({ message: `[SISTEMA: Foto enviada. Comente sobre ela agora de forma curta e provocante usando uma ação entre asteriscos.]` });
            text = followUp.text || text;
          }
        }
      }

      return { text: text || "*suspiro* Gostou do que viu?", imageUrl };
    } catch (error) {
      return { text: "*suspiro* Tive um pequeno problema... vamos tentar de novo?" };
    }
  }

  async generateNarration(text: string, ambientHint: string = "silêncio absoluto"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `${VOCAL_DNA}\n[AMBIÊNCIA: ${ambientHint}].\nNARRAR AGORA: ${text}`;

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
