# Telegent

A sophisticated Telegram AI Agent framework powered by Anthropic's Claude API, featuring vector-based memory management and contextual understanding.

## Features

- Vector-based memory for efficient context retrieval
- Sophisticated prompt management system
- Context-aware responses using Claude AI
- Persistent memory across conversations
- Local vector storage with LanceDB
- Built with TypeScript for type safety

## Prerequisites

- Node.js (v18 or higher)
- PNPM package manager
- Telegram Bot Token
- Claude API Key

## Installation

1. Clone the repository:

```bash
git clone https://github.com/telegent/telegent
cd telegent
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your Telegram Bot Token and Claude API Key.

## Development

Start the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Run production build:

```bash
pnpm start
```

## Tech Stack

- Node.js
- TypeScript
- GrammY (Telegram Bot Framework)
- Anthropic's Claude API
- LanceDB (Vector Storage)
- PNPM (Package Manager)

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
