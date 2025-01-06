import { Bot } from "grammy";
import { TelegentConfig } from "./types/config";
import { MemoryManager, AIHandler, ContextManager } from "./components";

export class Telegent {
  private bot: Bot;
  private memory: MemoryManager;
  private ai: AIHandler;
  private context: ContextManager;

  constructor(config: TelegentConfig) {
    this.bot = new Bot(config.telegram.token);
    this.memory = new MemoryManager(config.memory);
    this.ai = new AIHandler(config.claude);
    this.context = new ContextManager();

    this.setupHandlers();
  }

  private async setupHandlers() {
    // Initialize memory manager
    await this.memory.initialize();

    // Handle text messages
    this.bot.on("message:text", async (ctx) => {
      const chatId = ctx.chat.id;
      const messageText = ctx.message.text;

      try {
        // Generate embedding for the message
        const embedding = await this.ai.generateEmbedding(messageText);

        // Store user message
        await this.memory.storeMessage(chatId, "user", messageText, embedding);

        // Get recent message history
        const history = await this.memory.getRecentMessages(chatId);

        // Process message with AI
        const response = await this.ai.processMessage(
          messageText,
          undefined, // context
          history
        );

        // Store AI response
        await this.memory.storeMessage(
          chatId,
          "assistant",
          response,
          await this.ai.generateEmbedding(response)
        );

        // Send response
        await ctx.reply(response);
      } catch (error) {
        console.error("Error processing message:", error);
        await ctx.reply(
          "Sorry, I encountered an error processing your message. Please try again."
        );
      }
    });

    // Handle errors
    this.bot.catch((err) => {
      console.error("Error in bot:", err);
    });
  }

  async start() {
    console.log("Starting Telegent bot...");
    await this.bot.start({
      onStart: (botInfo) => {
        console.log(`Bot @${botInfo.username} started!`);
      },
    });
  }

  async stop() {
    console.log("Stopping Telegent bot...");
    await this.bot.stop();
  }
}
