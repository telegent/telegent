import Anthropic from "@anthropic-ai/sdk";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export class AIHandler {
  private client: Anthropic;
  private model = "claude-3-opus-20240229";
  private baseSystemPrompt: string;

  constructor(config: { apiKey: string }) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });

    this.baseSystemPrompt = `You are a helpful AI assistant in a Telegram chat. Keep responses clear and concise.`;
  }

  async processMessage(
    userMessage: string,
    context?: string,
    messageHistory: Message[] = []
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const messages = [
        { role: "user" as const, content: systemPrompt },
        ...messageHistory,
        { role: "user" as const, content: userMessage },
      ];

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1000,
        messages,
        temperature: 0.7,
      });

      return response.content[0].type === "text"
        ? response.content[0].text
        : "";
    } catch (error) {
      console.error("Error processing message:", error);
      throw new Error("Failed to process message");
    }
  }

  private buildSystemPrompt(context?: string): string {
    if (!context) return this.baseSystemPrompt;
    return `${this.baseSystemPrompt}\n\nContext from previous interactions:\n${context}`;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const words = text.toLowerCase().split(/\s+/);
      const uniqueWords = [...new Set(words)];
      const vector: number[] = new Array(256).fill(0);

      for (const word of uniqueWords) {
        const hash = this.hashString(word);
        const index = hash % 256;
        vector[index] += 1;
      }

      const magnitude = Math.sqrt(
        vector.reduce((sum, val) => sum + val * val, 0)
      );
      return vector.map((val) => (magnitude === 0 ? 0 : val / magnitude));
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
