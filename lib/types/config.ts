import { Character } from './character';

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
  character?: Character;
}
