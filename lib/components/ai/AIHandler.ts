import Claude from "@anthropic-ai/sdk";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export class AIHandler {
  private client: Claude;
  private model = "claude-3-opus-20240229";
  private baseSystemPrompt: string;

  constructor(config: { apiKey: string }) {
    this.client = new Claude({
      apiKey: config.apiKey,
    });

    this.baseSystemPrompt = `You are a helpful AI assistant in a Telegram chat. Keep responses clear and concise. If you detect multiple questions or tasks in a single message, address them in order.`;
  }

  async processMessage(
    userMessage: string,
    context?: string,
    messageHistory: Message[] = []
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);

      const messages = messageHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      messages.push({
        role: "user" as const,
        content: userMessage,
      });

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: messages as Claude.MessageParam[],
        temperature: 0.7,
        system: systemPrompt,
      });

      return response.content[0].type === "text"
        ? response.content[0].text
        : "";
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }

  private buildSystemPrompt(context?: string): string {
    if (!context) return this.baseSystemPrompt;
    return `${this.baseSystemPrompt}\n\nContext:\n${context}`;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(1536).fill(0);

    for (const word of words) {
      const idx = this.getWordIndex(word);
      vector[idx] += 1;
    }

    return this.normalizeVector(vector);
  }

  private getWordIndex(word: string): number {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 1536;
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );
    return magnitude === 0 ? vector : vector.map((val) => val / magnitude);
  }
}
