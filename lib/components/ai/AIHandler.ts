import Claude from "@anthropic-ai/sdk";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export class AIHandler {
  private client: Claude;
  private model = "claude-3-5-haiku-20241022";
  private baseSystemPrompt: string;

  constructor(config: { apiKey: string }) {
    this.client = new Claude({
      apiKey: config.apiKey,
    });

    this.baseSystemPrompt = `You are a helpful AI Agent in a Telegram chat. Keep responses clear and concise. If you detect multiple questions or tasks in a single message, address them in order. Please use the plugin capabilities context in your response. Do not say you cannot do something if there is a plugin that can do it.`;
  }

  async inferPluginActions(
    userMessage: string,
    pluginContext: string
  ): Promise<string> {
    const systemPrompt =
      "You are a plugin coordinator. Your task is to determine if any plugins should be used based on the user's message.\n" +
      "If a plugin should be used, respond ONLY with the plugin command in this format:\n" +
      "@plugin:plugin_name action param1 param2\n" +
      "If no plugin is needed, respond with 'none'.\n\n" +
      "Available plugins and capabilities:\n" +
      pluginContext;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 100,
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.1,
      system: systemPrompt,
    });

    return response.content[0].type === "text"
      ? response.content[0].text
      : "none";
  }

  async generateResponse(
    userMessage: string,
    pluginResult: string | null,
    context: string,
    messageHistory: Message[] = []
  ): Promise<string> {
    let systemPrompt = this.baseSystemPrompt;

    if (pluginResult?.startsWith("http")) {
      return `I've generated an image based on your request. Here it is: ${pluginResult}`;
    }

    if (pluginResult) {
      systemPrompt += "\n\nPlugin execution result:\n" + pluginResult;
    }

    if (context) {
      systemPrompt += "\n\nContext:\n" + context;
    }

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

    return response.content[0].type === "text" ? response.content[0].text : "";
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
