import { Telegent } from "../lib";

const bot = new Telegent({
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY || "",
  },
  memory: {
    path: "./data/vectordb",
  },
});

bot.start();
