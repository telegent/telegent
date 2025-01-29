# Telegent

[![npm](https://img.shields.io/npm/v/telegent?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/telegent)

Telegent is a flexible Telegram bot framework that lets you build and run your own AI agent, with support for multiple AI providers (Claude and DeepSeek), contextual understanding, and memory management.

## Installation

We recommend using the Telegent starter project to get started, which can be found [here](https://github.com/telegent/telegent-starter).

If you prefer to install the package manually, you can do so with the following command:

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
  ai: {
    provider: "claude", // or "deepseek"
    claudeApiKey: process.env.CLAUDE_API_KEY, // required if using Claude
    deepseekApiKey: process.env.DEEPSEEK_API_KEY, // required if using DeepSeek
  },
  memory: {
    path: path.join(__dirname, "data"),
  },
  // Optional configurations for plugins
  openai: {
    apiKey: process.env.OPENAI_API_KEY, // required for image generation
  },
  codex: {
    apiKey: process.env.CODEX_API_KEY, // required for code generation
  },
});

bot.start();
```

## Character Customization

You can customize your AI agent's personality and behavior:

```typescript
const bot = new Telegent({
  // ... other config options ...
  character: {
    name: "Assistant",
    role: "helpful AI assistant",
    basePersonality: "friendly and professional",
    traits: [
      {
        name: "Helpful",
        description: "Always eager to assist users",
      },
    ],
    customPrompt: "Additional custom instructions here",
  },
});
```

## Plugin System

Telegent supports a plugin system to extend functionality. Here's how to use plugins:

```typescript
import { Telegent } from "telegent";
import { SolanaPlugin, ImageGenPlugin, LoggerPlugin } from "telegent";

const bot = new Telegent({
  // ... configuration ...
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

- **Code Generation Plugin**: Provides code generation capabilities

  ```typescript
  import { CodexPlugin } from "telegent";
  ```

- **Logger Plugin**: Example plugin for logging bot activities
  ```typescript
  import { LoggerPlugin } from "telegent";
  ```

## Prerequisites

- Node.js 18+
- Telegram Bot Token
- AI Provider API Key (Claude or DeepSeek)
- Optional: OpenAI API Key (for image generation)
- Optional: Codex API Key (for code generation)

## Features

- Multiple AI Provider Support (Claude and DeepSeek)
- Plugin System
- Context-aware responses
- Local SQLite-based memory system
- Persistent conversation history
- Character customization
- TypeScript support

## Memory Management

Telegent includes a sophisticated memory system that:

- Stores conversation history
- Manages context for more relevant responses
- Extracts and stores important facts
- Automatically cleans up old messages

## API Reference

### Core Methods

```typescript
class Telegent {
  constructor(config: TelegentConfig);
  async start(): Promise<void>;
  async stop(): Promise<void>;
  async registerPlugin(plugin: Plugin): Promise<void>;
  async unregisterPlugin(pluginName: string): Promise<void>;
  async sendMessage(chatId: number, text: string): Promise<void>;
  async sendImage(
    chatId: number,
    imageUrl: string,
    caption?: string
  ): Promise<void>;
}
```

## Available Plugins

- Solana (Basic blockchain interactions)
- Image Generation (AI image creation)
- Code Generation (AI code assistance)
- Logger (Example Plugin)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
