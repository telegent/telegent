import { Codex } from "@codex-data/sdk";
import { BasePlugin } from "../../components/plugin/BasePlugin";
import { PluginMetadata, PluginResponse } from "../../types/plugin";
import { Telegent } from "../../Telegent";
import { TelegentConfig } from "../../types/config";

export class CodexPlugin extends BasePlugin {
  private sdk: Codex;
  private bot: Telegent | null = null;

  capabilities = [
    {
      name: "token",
      description: "Get detailed information about a Solana token",
      examples: [
        "Get info for token So11111111111111111111111111111111111111112",
        "Show token details for <address>",
        "What's the data for token <address>",
      ],
    },
    {
      name: "network",
      description: "Get Solana network information and statistics",
      examples: [
        "Show Solana network status",
        "Get network info",
        "What's the current Solana network state",
      ],
    },
  ];

  constructor(config: TelegentConfig) {
    const metadata: PluginMetadata = {
      name: "codex",
      version: "1.0.0",
      description: "Query Solana token and network data using Codex API",
      author: "Telegent",
    };

    super(metadata);

    if (!config.codex?.apiKey) {
      throw new Error("Codex API key is required");
    }

    this.sdk = new Codex(config.codex.apiKey);
  }

  async onLoad(bot: Telegent): Promise<void> {
    this.bot = bot;
    console.log(`[${this.metadata.name}] Plugin loaded`);
  }

  async execute(action: string, params: string[]): Promise<PluginResponse> {
    try {
      switch (action) {
        case "token":
          if (!params[0]) {
            return {
              result: "Please provide a token address",
              addToResponse: true,
            };
          }
          return await this.getTokenInfo(params[0]);

        default:
          return {
            result: `Unknown action: ${action}. Available actions: token`,
            addToResponse: true,
          };
      }
    } catch (error) {
      console.error(`[${this.metadata.name}] Error:`, error);
      return {
        result: `Error executing ${action}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        addToResponse: true,
      };
    }
  }

  private async getTokenInfo(address: string): Promise<PluginResponse> {
    try {
      const response = await this.sdk.queries.token({
        input: {
          address,
          networkId: 1399811149, // Solana mainnet network ID
        },
      });

      return {
        result: JSON.stringify(response, null, 2),
        addToResponse: true,
      };
    } catch (error) {
      return {
        result: `Error fetching token info: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        addToResponse: true,
      };
    }
  }

  async onUnload(): Promise<void> {
    console.log(`[${this.metadata.name}] Plugin unloaded`);
  }

  async onError(error: Error): Promise<void> {
    console.error(`[${this.metadata.name}] Error:`, error);
  }
}
