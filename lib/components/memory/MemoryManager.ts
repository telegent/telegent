import { connect } from "@lancedb/lancedb";

interface MessageRecord {
  chatId: number;
  timestamp: number;
  role: "user" | "assistant";
  content: string;
  embedding: number[];
}

export class MemoryManager {
  private dbPath: string;
  private db: any; // LanceDB connection
  private messagesTable: any;

  constructor(config: { path: string }) {
    this.dbPath = config.path;
  }

  async initialize() {
    this.db = await connect(this.dbPath);

    // Create or get messages table
    try {
      this.messagesTable = await this.db.openTable("messages");
    } catch {
      this.messagesTable = await this.db.createTable("messages", [
        {
          chatId: 0,
          timestamp: Date.now(),
          role: "user",
          content: "",
          embedding: new Array(256).fill(0),
        },
      ]);
    }
  }

  async storeMessage(
    chatId: number,
    role: "user" | "assistant",
    content: string,
    embedding: number[]
  ) {
    const record: MessageRecord = {
      chatId,
      timestamp: Date.now(),
      role,
      content,
      embedding,
    };

    await this.messagesTable.add([record]);
  }

  async getRecentMessages(chatId: number, limit: number = 10) {
    const messages = await this.messagesTable
      .filter(`chatId = ${chatId}`)
      .sort("timestamp", "desc")
      .limit(limit)
      .select(["role", "content"])
      .toArray();

    return messages.reverse();
  }

  async findSimilarMessages(
    chatId: number,
    embedding: number[],
    limit: number = 5
  ) {
    return await this.messagesTable
      .filter(`chatId = ${chatId}`)
      .limit(limit)
      .select(["role", "content"])
      .toArray();
  }

  async cleanup(olderThanDays: number = 30) {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    await this.messagesTable.delete(`timestamp < ${cutoffTime}`);
  }
}
