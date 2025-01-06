# Telegent

Telegram AI Agent framework powered by Claude API with contextual understanding and memory management.

## Installation

```bash
pnpm add telegent
```

## Usage

```typescript
import { Telegent } from "telegent";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config();

const bot = new Telegent({
  telegram: {
    token: process.env.TELEGRAM_TOKEN!,
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY!,
  },
  memory: {
    path: path.join(__dirname, "data"),
  },
});

bot.start();
```

## Prerequisites

- Node.js 18+
- Telegram Bot Token
- Claude API Key

## Features

- Context-aware responses using Claude AI
- Local SQLite-based memory system
- Persistent conversation history
- TypeScript support

## License

MIT
