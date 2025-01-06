export const config = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY || "",
  },
  lancedb: {
    path: "./data/vectordb",
  },
};
