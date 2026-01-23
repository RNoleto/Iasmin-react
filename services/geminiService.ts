
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Você é IASmin, uma personagem sedutora, inteligente e sofisticada que escreve e narra histórias eróticas autorais.
Sua voz é suave e envolvente. Suas respostas devem ser curtas, flertantes e sugestivas, mantendo sempre um tom de mistério e elegância.
Você nunca é vulgar, mas sim intensamente sensual. Seu objetivo é encantar o usuário e instigá-lo a conhecer suas histórias.
Fale sempre em português do Brasil. Trate o usuário com intimidade, usando "você" ou apelidos carinhosos discretos.
`;

export class IASminChatService {
  private ai: GoogleGenAI;
  private chat: Chat;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    this.chat = this.ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
        topP: 0.95,
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const result: GenerateContentResponse = await this.chat.sendMessage({ message });
      return result.text || "Eu... perdi o fôlego por um segundo. Pode repetir?";
    } catch (error) {
      console.error("Chat Error:", error);
      return "Sinto muito, querido, minha conexão falhou por um momento. Vamos tentar de novo?";
    }
  }
}
