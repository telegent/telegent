import {
  Plugin,
  PluginConfig,
  PluginMetadata,
  PluginCapability,
  PluginResponse,
} from "../../types/plugin";
import { Telegent } from "../../Telegent";

export abstract class BasePlugin implements Plugin {
  protected telegent: Telegent | null = null;
  protected config: PluginConfig;
  abstract capabilities: PluginCapability[];

  constructor(
    public readonly metadata: PluginMetadata,
    config: PluginConfig = {}
  ) {
    this.config = config;
  }

  abstract execute(action: string, params: any): Promise<PluginResponse>;

  async onLoad(telegent: Telegent): Promise<void> {
    this.telegent = telegent;
  }

  async onUnload(): Promise<void> {
    this.telegent = null;
  }

  async onError?(error: Error): Promise<void>;
}
