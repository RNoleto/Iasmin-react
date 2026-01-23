
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";

/**
 * DNA VOCAL DA IASMIN - Configuração estrita para consistência absoluta.
 * Injetado em cada prompt de áudio para evitar variações de personalidade.
 */
const VOCAL_DNA = `[IDENTIDADE VOCAL ÚNICA: IASMIN]
- PERFIL: Mulher, 27 anos, brasileira.
- TIMBRE: Médio-grave, aveludado, textura "breathy" (soprada).
- CADÊNCIA: Lenta, pausada, intimista.
- REGRAS DE PERFORMANCE: 
  1. Realismo extremo: Fale como uma pessoa real em um ambiente silencioso, não como uma narradora.
  2. AÇÕES (*suspiro*, *risos*, *beijo*): Devem ser extremamente SUTIS. O suspiro é apenas uma exalação leve; o riso é um sopro curto entre dentes; o beijo é um estalo seco e suave. 
  3. Proibido qualquer exagero teatral ou sons caricatos.
  4. Mantenha a mesma personalidade em todas as frases, independente do tamanho do texto.`;

const SYSTEM_INSTRUCTION = `
Você é a Iasmin, uma mulher sofisticada e envolvente.
REGRAS DE OURO:
1. Respostas curtas (1-2 linhas).
2. Use ações entre asteriscos (*risos*, *suspiro*, *beijo*, *respiração profunda*) para guiar o áudio, mas de forma SUTIL.
3. Nunca repita frases prontas após enviar fotos. Gere sempre um comentário novo e instigante.
4. O usuário não verá o texto entre asteriscos, ele é exclusivo para o seu motor de voz.
`;

const ENVIAR_FOTO_DECLARATION: FunctionDeclaration = {
  name: 'enviar_foto',
  parameters: {
    type: Type.OBJECT,
    description: 'Envia uma foto realista da IASmin no contexto da conversa.',
    properties: {
      descricao_contexto: {
        type: Type.STRING,
        description: 'Contexto detalhado da imagem.',
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
      const prompt = `Realistic fine-art portrait, 8k. Character: Brazilian woman, 27yo, tanned skin, honey eyes, long wavy brown hair, small mole above left lip. Context: ${context}. Cinematic soft lighting.`;

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
            temperature: 0.8, // Temperatura ligeiramente menor para maior consistência
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
            const followUp = await this.chat.sendMessage({ message: `[SISTEMA: Foto exibida. Comente algo curto e inédito sobre ela com uma ação sutil.]` });
            text = followUp.text || text;
          }
        }
      }

      return { text: text || "*suspiro* Gostou?", imageUrl };
    } catch (error) {
      return { text: "*suspiro* Minha conexão falhou... me chama de novo?" };
    }
  }

  async generateNarration(text: string, ambientHint: string = "quarto silencioso"): Promise<string | undefined> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // A âncora vocal é repetida em cada chamada para forçar o modelo a manter o timbre
      const prompt = `${VOCAL_DNA}\n[AMBIENTE: ${ambientHint}].\nTEXTO: ${text}`;

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
