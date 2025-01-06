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
  }

  async start() {
    await this.bot.start();
  }
}
