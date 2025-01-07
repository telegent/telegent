import { BasePlugin } from "../../components/plugin/BasePlugin";
import { PluginMetadata } from "../../types/plugin";

export interface LoggerPluginConfig {
  logToConsole?: boolean;
  logToFile?: boolean;
  logPath?: string;
}

export class LoggerPlugin extends BasePlugin {
  constructor(config: LoggerPluginConfig = {}) {
    const metadata: PluginMetadata = {
      name: "logger",
      version: "1.0.0",
      description: "Logs all messages and errors for debugging purposes",
      author: "Telegent",
    };

    super(metadata, config);
    this.config = {
      logToConsole: true,
      logToFile: false,
      logPath: "./logs",
      ...config,
    } as LoggerPluginConfig;
  }

  async onLoad(): Promise<void> {
    console.log(`[${this.metadata.name}] Plugin loaded`);
  }

  async onUnload(): Promise<void> {
    console.log(`[${this.metadata.name}] Plugin unloaded`);
  }

  async onMessage(chatId: number, message: string): Promise<void> {
    if (this.config.logToConsole) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Chat ${chatId}: ${message}`);
    }
  }

  async onError(error: Error): Promise<void> {
    if (this.config.logToConsole) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] Error:`, error.message);
      console.error(error.stack);
    }
  }
}
