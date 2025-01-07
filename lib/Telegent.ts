import { Bot } from "grammy";
import { TelegentConfig } from "./types/config";
import { MemoryManager } from "./components/memory/MemoryManager";
import { AIHandler } from "./components/ai/AIHandler";
import { ContextManager } from "./components/context/ContextManager";
import { Plugin } from "./types/plugin";

export class Telegent {
  private bot: Bot;
  private memory: MemoryManager;
  private ai: AIHandler;
  private context: ContextManager;
  private plugins: Map<string, Plugin> = new Map();

  constructor(config: TelegentConfig) {
    this.bot = new Bot(config.telegram.token);
    this.memory = new MemoryManager(config.memory);
    this.ai = new AIHandler(config.claude);
    this.context = new ContextManager(config.memory);

    this.setupHandlers();
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.metadata.name)) {
      throw new Error(`Plugin ${plugin.metadata.name} is already registered`);
    }

    this.plugins.set(plugin.metadata.name, plugin);
    if (plugin.onLoad) {
      await plugin.onLoad(this);
    }
  }

  async unregisterPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not registered`);
    }

    if (plugin.onUnload) {
      await plugin.onUnload();
    }
    this.plugins.delete(pluginName);
  }

  private async setupHandlers() {
    await Promise.all([this.memory.initialize(), this.context.initialize()]);

    this.bot.on("message:text", async (ctx) => {
      const chatId = ctx.chat.id;
      const messageText = ctx.message.text;
      const userId = ctx.from?.id || 0;
      const username = ctx.from?.username;

      try {
        // Notify plugins about the message
        for (const plugin of this.plugins.values()) {
          if (plugin.onMessage) {
            await plugin.onMessage(chatId, messageText);
          }
        }

        // Get context and history
        const [history, contextString] = await Promise.all([
          this.memory.getRecentMessages(chatId),
          this.context.buildContextString(chatId),
        ]);

        // Process message with AI
        const response = await this.ai.processMessage(
          messageText,
          contextString,
          history
        );

        // Store messages
        await Promise.all([
          this.storeMessage("user", chatId, messageText),
          this.storeMessage("assistant", chatId, response),
        ]);

        // Extract facts if any
        if (response.includes("Important fact:")) {
          const facts = response
            .split("\n")
            .filter((line) => line.includes("Important fact:"))
            .map((line) => line.replace("Important fact:", "").trim());

          await Promise.all(
            facts.map((fact) => this.context.addFact(chatId, fact))
          );
        }

        await ctx.reply(response);
      } catch (error) {
        // Notify plugins about the error
        for (const plugin of this.plugins.values()) {
          if (plugin.onError) {
            await plugin.onError(error as Error);
          }
        }

        console.error("Error processing message:", error);
        await ctx.reply(
          "Sorry, I encountered an error processing your message. Please try again."
        );
      }
    });

    this.bot.catch((err) => {
      console.error("Error in bot:", err);
    });
  }

  private async storeMessage(
    role: "user" | "assistant",
    chatId: number,
    content: string
  ) {
    const embedding = await this.ai.generateEmbedding(content);
    await this.memory.storeMessage(chatId, role, content, embedding);
  }

  async start() {
    console.log("Starting Telegent bot...");

    // Daily cleanup
    setInterval(async () => {
      await Promise.all([this.memory.cleanup(), this.context.cleanup()]);
    }, 24 * 60 * 60 * 1000);

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
