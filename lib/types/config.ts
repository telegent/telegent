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
}
