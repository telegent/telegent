import { BasePlugin } from "../../components/plugin/BasePlugin";
import { PluginMetadata, PluginResponse } from "../../types/plugin";

export interface LoggerPluginConfig {
  logToConsole?: boolean;
  logToFile?: boolean;
  logPath?: string;
}

export class LoggerPlugin extends BasePlugin {
  private logs: string[] = [];
  private maxLogs = 10;

  capabilities = [
    {
      name: "log",
      description: "Logs messages and shows recent logs",
      examples: ["Show recent logs", "Log this message", "Check system logs"],
    },
  ];

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

  async execute(action: string, params: any): Promise<PluginResponse> {
    switch (action) {
      case "log":
        this.log(params.join(" "));
        return { result: "", addToResponse: false };

      case "show":
        if (this.logs.length === 0) {
          return {
            result: "No logs available",
            addToResponse: true,
          };
        }
        return {
          result: "Recent logs:\n" + this.logs.slice(-10).join("\n"),
          addToResponse: true,
        };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;

    this.logs.push(formattedMessage);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.log(formattedMessage);
  }

  async onError(error: Error): Promise<void> {
    this.log(`ERROR: ${error.message}`);
    if (error.stack) {
      this.log(`Stack: ${error.stack}`);
    }
  }

  async onLoad(): Promise<void> {
    this.log(`${this.metadata.name} Plugin loaded`);
  }

  async onUnload(): Promise<void> {
    this.log(`${this.metadata.name} Plugin unloaded`);
  }
}
