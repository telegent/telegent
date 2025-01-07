import { Telegent } from "../Telegent";

export interface PluginConfig {
  [key: string]: any;
}

export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
}

export interface Plugin {
  metadata: PluginMetadata;
  onLoad?(telegent: Telegent): Promise<void> | void;
  onUnload?(): Promise<void> | void;
  onMessage?(chatId: number, message: string): Promise<void> | void;
  onError?(error: Error): Promise<void> | void;
}
