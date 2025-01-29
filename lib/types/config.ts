import { Character } from "./character";

export type AIConfig = {
  provider: "claude" | "deepseek";
  claudeApiKey?: string;
  deepseekApiKey?: string;
};

export interface TelegentConfig {
  telegram: {
    token: string;
  };
  ai: AIConfig;
  memory: {
    path: string;
  };
  openai?: {
    apiKey: string;
  };
  codex?: {
    apiKey: string;
  };
  character?: Character;
}
