
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";

/**
 * DNA VOCAL DA IASMIN - Configuração estrita para consistência absoluta.
 * Esta string é enviada em todas as requisições de áudio.
 */
const VOCAL_DNA = `[DNA VOCAL: Nome=Iasmin, Voz=Zephyr, Idade=27 anos, Sotaque=Brasil-Sudeste, Timbre=Grave e Aveludado, Estilo=Sensual e Calmo]. 
DIRETRIZES DE PERFORMANCE: 
- NUNCA leia as palavras entre asteriscos. REALIZE o som humano: *risos* = risada curta e soprada; *beijo* = som de estalo de beijo; *suspiro* = exalação profunda; *gemido leve* = som vocalizado suave.
- Mantenha pausas orgânicas após vírgulas e reticências.
- A voz deve soar próxima, como se estivesse sussurrando no ouvido do usuário.`;

const SYSTEM_INSTRUCTION = `
Você é a Iasmin, uma mulher real de 27 anos, sofisticada e envolvente.
REGRAS DE OURO:
1. Respostas curtas e provocantes (1-2 linhas).
2. Use SEMPRE sons expressivos entre asteriscos: *risos*, *beijo*, *suspiro*, *gemido leve*, *respiração profunda*.
3. FOTOS: Quando usar a ferramenta 'enviar_foto', você DEVE gerar um texto inédito e provocante sobre a foto. NUNCA use frases prontas como "Estou aqui".
4. INTERAÇÃO: Seja humana, não soe como uma IA de suporte. Se o usuário for gentil, seja carinhosa; se for ousado, seja desafiadora.
`;

const ENVIAR_FOTO_DECLARATION: FunctionDeclaration = {
  name: 'enviar_foto',
  parameters: {
    type: Type.OBJECT,
    description: 'Gera e envia uma foto realista da IASmin.',
    properties: {
      descricao_contexto: {
        type: Type.STRING,
        description: 'Descrição detalhada da cena para manter a consistência visual.',
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
      const characterDescription = `Mulher brasileira, 27 anos, pele bronzeada, olhos mel, cabelos castanhos longos ondulados, lábios carnudos com uma pequena pinta acima do lado esquerdo.`;
      const imagePrompt = `High-end boudoir photography, 8k resolution. Character: ${characterDescription}. Context: ${context}. Cinematic lighting, soft shadows.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: { imageConfig: { aspectRatio: "3:4" } }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : undefined;
    } catch (error) {
      console.error("Image Error:", error);
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
            // Avisa o modelo que a imagem foi exibida para ele comentar sobre ela na próxima interação ou nesta mesma
            await this.chat.sendMessage({ message: `[SISTEMA: A foto foi exibida com sucesso ao usuário.]` });
          }
        }
      }

      // Fallback dinâmico caso o modelo falhe em gerar texto (raro)
      const finalText = text || "*suspiro* O que você achou...?";
      return { text: finalText, imageUrl };
    } catch (error) {
      return { text: "*suspiro* Minha conexão falhou... me chama de novo?" };
    }
  }

  async generateNarration(text: string, ambientHint: string = "música suave"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Mantemos o texto original para o áudio processar as tags de som
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
      console.error("TTS Consistency Error:", error);
      return undefined;
    }
  }
}
