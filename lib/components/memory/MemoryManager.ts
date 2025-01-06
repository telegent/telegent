import { connect } from "@lancedb/lancedb";
import * as arrow from "apache-arrow";

interface MessageRecord {
  chatId: number;
  timestamp: number;
  role: "user" | "assistant";
  content: string;
  embedding: number[];
}

export class MemoryManager {
  private dbPath: string;
  private db: any;
  private messagesTable: any;

  constructor(config: { path: string }) {
    this.dbPath = config.path;
  }

  async initialize() {
    this.db = await connect(this.dbPath);

    try {
      this.messagesTable = await this.db.openTable("messages");
    } catch {
      // Define schema using Arrow
      const schema = new arrow.Schema([
        new arrow.Field("chatId", new arrow.Int32()),
        new arrow.Field("timestamp", new arrow.Int64()),
        new arrow.Field("role", new arrow.Utf8()),
        new arrow.Field("content", new arrow.Utf8()),
        new arrow.Field(
          "embedding",
          new arrow.FixedSizeList(
            256,
            new arrow.Field("item", new arrow.Float32())
          )
        ),
      ]);

      // Create empty table with schema
      this.messagesTable = await this.db.createEmptyTable("messages", schema);

      // Add initial data
      const defaultEmbedding = new Float32Array(256).fill(0);
      await this.messagesTable.add([
        {
          chatId: 0,
          timestamp: Date.now(),
          role: "user",
          content: "",
          embedding: Array.from(defaultEmbedding),
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
      embedding: Array.from(embedding),
    };

    await this.messagesTable.add([record]);
  }

  async getRecentMessages(chatId: number, limit: number = 10) {
    const messages = await this.messagesTable
      .search("*")
      .where(`chatId = ${chatId}`)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .execute();

    return messages.reverse();
  }

  async findSimilarMessages(
    chatId: number,
    embedding: number[],
    limit: number = 5
  ) {
    return await this.messagesTable
      .search("*")
      .where(`chatId = ${chatId}`)
      .limit(limit)
      .execute();
  }

  async cleanup(olderThanDays: number = 30) {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    await this.messagesTable
      .search("*")
      .where(`timestamp < ${cutoffTime}`)
      .remove();
  }
}
