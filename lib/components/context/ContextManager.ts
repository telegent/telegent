import { connect } from "@lancedb/lancedb";
import * as arrow from "apache-arrow";

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
    console.log("DB connection:", this.db);

    try {
      this.contextTable = await this.db.openTable("contexts");
      console.log("Context table:", this.contextTable);
    } catch (error) {
      console.error("Error opening table:", error);

      // Define schema using Arrow
      const schema = new arrow.Schema([
        new arrow.Field("chatId", new arrow.Int32()),
        new arrow.Field("userId", new arrow.Int32()),
        new arrow.Field("username", new arrow.Utf8()),
        new arrow.Field("language", new arrow.Utf8()),
        new arrow.Field("preferences", new arrow.Utf8()), // Store as JSON string
        new arrow.Field("lastActive", new arrow.Int64()),
        new arrow.Field(
          "facts",
          new arrow.List(new arrow.Field("item", new arrow.Utf8()))
        ),
      ]);

      try {
        // Create empty table with schema
        this.contextTable = await this.db.createEmptyTable("contexts", schema);

        // Add initial data
        await this.contextTable.add([
          {
            chatId: 0,
            userId: 0,
            lastActive: Date.now(),
            facts: ["placeholder"],
            preferences: "{}",
            language: "en",
            username: "",
          },
        ]);

        console.log("Created table:", this.contextTable);
      } catch (createError) {
        console.error("Error creating table:", createError);
        throw createError;
      }
    }
  }

  async getContext(
    chatId: number,
    userId: number,
    username?: string
  ): Promise<ChatContext> {
    if (this.cache.has(chatId)) {
      const context = this.cache.get(chatId)!;
      context.lastActive = Date.now();
      return context;
    }

    const results = await this.contextTable
      .search("*")
      .where(`chatId = ${chatId}`)
      .execute();

    if (results.length > 0) {
      const context = results[0];
      this.cache.set(chatId, context);
      return context;
    }

    const newContext: ChatContext = {
      chatId,
      userId,
      username,
      lastActive: Date.now(),
      facts: [],
      preferences: {},
    };

    await this.contextTable.add([newContext]);
    this.cache.set(chatId, newContext);
    return newContext;
  }

  async updateContext(chatId: number, updates: Partial<ChatContext>) {
    const context = await this.getContext(chatId, updates.userId || 0);
    const updatedContext = {
      ...context,
      ...updates,
      lastActive: Date.now(),
      facts: updates.facts || context.facts || [],
      preferences: updates.preferences || context.preferences || {},
    };

    await this.contextTable.search("*").where(`chatId = ${chatId}`).remove();
    await this.contextTable.add([updatedContext]);
    this.cache.set(chatId, updatedContext);
  }

  async addFact(chatId: number, fact: string) {
    const context = await this.getContext(chatId, 0);
    const facts = [...(context.facts || []), fact];
    await this.updateContext(chatId, { facts });
  }

  async buildContextString(chatId: number): Promise<string> {
    const context = await this.getContext(chatId, 0);
    let contextString = "";

    if (context.facts && context.facts.length > 0) {
      contextString += "Important facts from previous conversations:\n";
      contextString += context.facts.map((fact) => `- ${fact}`).join("\n");
      contextString += "\n\n";
    }

    if (context.preferences && Object.keys(context.preferences).length > 0) {
      contextString += "User preferences:\n";
      for (const [key, value] of Object.entries(context.preferences)) {
        contextString += `- ${key}: ${value}\n`;
      }
    }

    return contextString.trim();
  }

  async cleanup(olderThanDays: number = 3) {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    await this.contextTable
      .search("*")
      .where(`lastActive < ${cutoffTime}`)
      .remove();

    for (const [chatId, context] of this.cache.entries()) {
      if (context.lastActive < cutoffTime) {
        this.cache.delete(chatId);
      }
    }
  }
}
