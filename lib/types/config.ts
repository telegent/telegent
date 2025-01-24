import { Character } from "./character";

export interface TelegentConfig {
  telegram: {
    token: string;
  };
  claude: {
    apiKey: string;
  };
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
