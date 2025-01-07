import { Plugin, PluginConfig, PluginMetadata } from "../../types/plugin";
import { Telegent } from "../../Telegent";

export abstract class BasePlugin implements Plugin {
  protected telegent: Telegent | null = null;
  protected config: PluginConfig;

  constructor(
    public readonly metadata: PluginMetadata,
    config: PluginConfig = {}
  ) {
    this.config = config;
  }

  async onLoad(telegent: Telegent): Promise<void> {
    this.telegent = telegent;
  }

  async onUnload(): Promise<void> {
    this.telegent = null;
  }

  async onMessage?(chatId: number, message: string): Promise<void>;
  async onError?(error: Error): Promise<void>;
}
