// lib/components/context/ContextManager.ts
import { connect } from "@lancedb/lancedb";

interface ChatContext {
  chatId: number;
  userId: number;
  username?: string;
  language?: string;
  preferences?: Record<string, any>;
  lastActive: number;
  facts: string[];
}

export class ContextManager {
  private dbPath: string;
  private db: any;
  private contextTable: any;
  private cache: Map<number, ChatContext>;

  constructor(config: { path: string }) {
    this.dbPath = config.path;
    this.cache = new Map();
  }

  async initialize() {
    this.db = await connect(this.dbPath);

    try {
      this.contextTable = await this.db.openTable("contexts");
    } catch {
      this.contextTable = await this.db.createTable("contexts", [
        {
          chatId: 0,
          userId: 0,
          lastActive: Date.now(),
          facts: [],
        },
      ]);
    }
  }

  async getContext(
    chatId: number,
    userId: number,
    username?: string
  ): Promise<ChatContext> {
    // Check cache first
    if (this.cache.has(chatId)) {
      const context = this.cache.get(chatId)!;
      context.lastActive = Date.now();
      return context;
    }

    // Get from database
    const results = await this.contextTable
      .filter(`chatId = ${chatId}`)
      .select(["*"])
      .toArray();

    if (results.length > 0) {
      const context = results[0];
      this.cache.set(chatId, context);
      return context;
    }

    // Create new context
    const newContext: ChatContext = {
      chatId,
      userId,
      username,
      lastActive: Date.now(),
      facts: [],
    };

    await this.contextTable.add([newContext]);
    this.cache.set(chatId, newContext);
    return newContext;
  }

  async updateContext(chatId: number, updates: Partial<ChatContext>) {
    const context = await this.getContext(chatId, updates.userId || 0);
    const updatedContext = { ...context, ...updates, lastActive: Date.now() };

    await this.contextTable.delete(`chatId = ${chatId}`);
    await this.contextTable.add([updatedContext]);
    this.cache.set(chatId, updatedContext);
  }

  async addFact(chatId: number, fact: string) {
    const context = await this.getContext(chatId, 0);
    context.facts.push(fact);
    await this.updateContext(chatId, { facts: context.facts });
  }

  async buildContextString(chatId: number): Promise<string> {
    const context = await this.getContext(chatId, 0);
    let contextString = "";

    if (context.facts.length > 0) {
      contextString += "Important facts from previous conversations:\n";
      contextString += context.facts.map((fact) => `- ${fact}`).join("\n");
      contextString += "\n\n";
    }

    if (context.preferences) {
      contextString += "User preferences:\n";
      for (const [key, value] of Object.entries(context.preferences)) {
        contextString += `- ${key}: ${value}\n`;
      }
    }

    return contextString.trim();
  }

  // Cleanup old contexts
  async cleanup(olderThanDays: number = 3) {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    await this.contextTable.delete(`lastActive < ${cutoffTime}`);

    // Clear cache of old items
    for (const [chatId, context] of this.cache.entries()) {
      if (context.lastActive < cutoffTime) {
        this.cache.delete(chatId);
      }
    }
  }
}
