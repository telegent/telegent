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

export interface PluginCapability {
  name: string;
  description: string;
  examples: string[];
}

export interface PluginResponse {
  result: string; // Result to be added to AI response
  addToResponse?: boolean; // Whether to add result to AI response
}

export interface Plugin {
  metadata: PluginMetadata;
  capabilities: PluginCapability[];
  execute(action: string, params: any): Promise<PluginResponse>;
  onLoad?(telegent: Telegent): Promise<void> | void;
  onUnload?(): Promise<void> | void;
  onError?(error: Error): Promise<void> | void;
}
