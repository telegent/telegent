# Telegent

[![npm](https://img.shields.io/npm/v/telegent?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/telegent)

Telegent makes it easy for you to build and run your own AI agent on Telegram, powered by Anthropic's Claude API with contextual understanding and memory management.

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
    token: process.env.TELEGRAM_TOKEN,
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
  },
  memory: {
    path: path.join(__dirname, "data"),
  },
});

bot.start();
```

## Plugin System

Telegent supports a plugin system to extend functionality. Here's how to use plugins:

```typescript
import { Telegent } from "telegent";
import { SolanaPlugin, ImageGenPlugin, LoggerPlugin } from "telegent";

const bot = new Telegent({
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
  },
  memory: {
    path: path.join(__dirname, "data"),
  },
});

// Register plugins
bot.use(new SolanaPlugin());
bot.use(new ImageGenPlugin());
bot.use(new LoggerPlugin());

bot.start();
```

### Built-in Plugins

- **Solana Plugin**: Adds Solana blockchain interaction capabilities
  ```typescript
  import { SolanaPlugin } from "telegent";
  ```

- **Image Generation Plugin**: Enables AI image generation
  ```typescript
  import { ImageGenPlugin } from "telegent";
  ```

- **Logger Plugin**: Example plugin for logging bot activities
  ```typescript
  import { LoggerPlugin } from "telegent";
  ```

## Prerequisites

- Node.js 18+
- Telegram Bot Token
- Claude API Key

## Features

- Plugin System
- Context-aware responses using Claude AI
- Local SQLite-based memory system
- Persistent conversation history
- TypeScript support

## Available Plugins

- Solana (Basic)
- Image Generation (Basic)
- Logger (Example Plugin)

## License

MIT
