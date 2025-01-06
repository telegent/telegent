import Database from "better-sqlite3";
import { join } from "path";

interface ChatContext {
  chatId: number;
  userId: number;
  username?: string;
  language?: string;
  preferences?: Record<string, any>;
  lastActive: number;
  facts: string[];
}

type DBContext = {
  chatId: number;
  userId: number;
  username: string | null;
  language: string | null;
  preferences: string;
  lastActive: number;
  facts: string;
};

export class ContextManager {
  private db: Database.Database;
  private cache: Map<number, ChatContext>;

  constructor(config: { path: string }) {
    this.db = new Database(join(config.path, "contexts.db"));
    this.cache = new Map();
  }

  async initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contexts (
        chatId INTEGER PRIMARY KEY,
        userId INTEGER NOT NULL,
        username TEXT,
        language TEXT,
        preferences TEXT,
        lastActive INTEGER NOT NULL,
        facts TEXT
      )
    `);
  }

  private parseDBContext(row: DBContext): ChatContext {
    return {
      chatId: row.chatId,
      userId: row.userId,
      username: row.username || undefined,
      language: row.language || undefined,
      preferences: JSON.parse(row.preferences),
      lastActive: row.lastActive,
      facts: JSON.parse(row.facts),
    };
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

    const stmt = this.db.prepare("SELECT * FROM contexts WHERE chatId = ?");
    const row = stmt.get(chatId) as DBContext | undefined;

    if (!row) {
      const newContext: ChatContext = {
        chatId,
        userId,
        username,
        language: "en",
        preferences: {},
        lastActive: Date.now(),
        facts: [],
      };

      this.db
        .prepare(
          `
        INSERT INTO contexts (chatId, userId, username, language, preferences, lastActive, facts)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
        )
        .run(
          chatId,
          userId,
          username || null,
          "en",
          JSON.stringify({}),
          Date.now(),
          JSON.stringify([])
        );

      this.cache.set(chatId, newContext);
      return newContext;
    }

    const context = this.parseDBContext(row);
    this.cache.set(chatId, context);
    return context;
  }

  async updateContext(chatId: number, updates: Partial<ChatContext>) {
    const context = await this.getContext(chatId, updates.userId || 0);
    const updatedContext: ChatContext = {
      ...context,
      ...updates,
      lastActive: Date.now(),
      facts: updates.facts || context.facts,
      preferences: updates.preferences || context.preferences || {},
    };

    this.db
      .prepare(
        `
      UPDATE contexts 
      SET userId = ?, username = ?, language = ?, preferences = ?, lastActive = ?, facts = ?
      WHERE chatId = ?
    `
      )
      .run(
        updatedContext.userId,
        updatedContext.username || null,
        updatedContext.language || null,
        JSON.stringify(updatedContext.preferences),
        updatedContext.lastActive,
        JSON.stringify(updatedContext.facts),
        chatId
      );

    this.cache.set(chatId, updatedContext);
  }

  async addFact(chatId: number, fact: string) {
    const context = await this.getContext(chatId, 0);
    const facts = [...context.facts, fact];
    await this.updateContext(chatId, { facts });
  }

  async buildContextString(chatId: number): Promise<string> {
    const context = await this.getContext(chatId, 0);
    let contextString = "";

    if (context.facts.length > 0) {
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

    this.db
      .prepare("DELETE FROM contexts WHERE lastActive < ?")
      .run(cutoffTime);

    for (const [chatId, context] of this.cache.entries()) {
      if (context.lastActive < cutoffTime) {
        this.cache.delete(chatId);
      }
    }
  }
}
