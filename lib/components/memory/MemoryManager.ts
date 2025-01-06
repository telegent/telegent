import Database from "better-sqlite3";
import { join } from "path";

interface MessageRecord {
  chatId: number;
  timestamp: number;
  role: "user" | "assistant";
  content: string;
  embedding: number[];
}

type DBMessage = {
  chatId: number;
  timestamp: number;
  role: "user" | "assistant";
  content: string;
  embedding: string;
};

export class MemoryManager {
  private db: Database.Database;

  constructor(config: { path: string }) {
    this.db = new Database(join(config.path, "messages.db"));
  }

  async initialize() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        chatId INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding TEXT NOT NULL,
        PRIMARY KEY (chatId, timestamp)
      );
      CREATE INDEX IF NOT EXISTS idx_chat_time ON messages(chatId, timestamp);
    `);
  }

  private parseDBMessage(row: DBMessage): MessageRecord {
    return {
      chatId: row.chatId,
      timestamp: row.timestamp,
      role: row.role,
      content: row.content,
      embedding: JSON.parse(row.embedding),
    };
  }

  async storeMessage(
    chatId: number,
    role: "user" | "assistant",
    content: string,
    embedding: number[]
  ) {
    this.db
      .prepare(
        `
      INSERT INTO messages (chatId, timestamp, role, content, embedding)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(chatId, Date.now(), role, content, JSON.stringify(embedding));
  }

  async getRecentMessages(
    chatId: number,
    limit: number = 10
  ): Promise<MessageRecord[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE chatId = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    const rows = stmt.all(chatId, limit) as DBMessage[];

    return rows.map((row) => this.parseDBMessage(row)).reverse();
  }

  async findSimilarMessages(
    chatId: number,
    embedding: number[],
    limit: number = 5
  ): Promise<MessageRecord[]> {
    const stmt = this.db.prepare("SELECT * FROM messages WHERE chatId = ?");
    const rows = stmt.all(chatId) as DBMessage[];

    return rows
      .map((row) => ({
        ...this.parseDBMessage(row),
        similarity: this.cosineSimilarity(embedding, JSON.parse(row.embedding)),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ similarity, ...record }) => record);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async cleanup(olderThanDays: number = 30) {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    this.db.prepare("DELETE FROM messages WHERE timestamp < ?").run(cutoffTime);
  }
}
