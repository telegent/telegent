import { BasePlugin } from "../../components/plugin/BasePlugin";
import { PluginMetadata, PluginResponse } from "../../types/plugin";
import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

export interface SolanaPluginConfig {
  dataPath: string;
}

export class SolanaPlugin extends BasePlugin {
  private walletPath: string;
  private keypair: Keypair | null = null;

  capabilities = [
    {
      name: "create_wallet",
      description: "Creates a new Solana wallet for the agent",
      examples: [
        "new Solana wallet",
        "Create a wallet for me",
        "Generate a Solana address",
      ],
    },
    {
      name: "show_wallet",
      description: "Shows the current wallet address",
      examples: [
        "What's your wallet address?",
        "Show your Solana wallet",
        "Display wallet info",
      ],
    },
  ];

  constructor(config: SolanaPluginConfig) {
    const metadata: PluginMetadata = {
      name: "solana",
      version: "1.0.0",
      description: "Manages Solana wallet for the agent",
      author: "Telegent",
    };

    super(metadata, config);
    this.walletPath = path.join(config.dataPath, "wallet.json");
  }

  async onLoad(): Promise<void> {
    // Load existing wallet if it exists
    if (fs.existsSync(this.walletPath)) {
      const walletData = JSON.parse(fs.readFileSync(this.walletPath, "utf-8"));
      this.keypair = Keypair.fromSecretKey(
        new Uint8Array(walletData.secretKey)
      );
      console.log(
        `[${
          this.metadata.name
        }] Loaded existing wallet: ${this.keypair.publicKey.toString()}`
      );
    }
  }

  async execute(action: string, params: any): Promise<PluginResponse> {
    switch (action) {
      case "create_wallet":
        if (this.hasWallet()) {
          return {
            result: `Wallet already exists!\nPublic Key: ${this.keypair?.publicKey.toString()}`,
            addToResponse: true,
          };
        }
        await this.createWallet();
        return {
          result: `Created new Solana wallet!\nPublic Key: ${this.keypair?.publicKey.toString()}`,
          addToResponse: true,
        };

      case "show_wallet":
        if (!this.hasWallet()) {
          return {
            result: "No wallet created yet. Ask me to create one for you!",
            addToResponse: true,
          };
        }
        return {
          result: `Wallet Public Key: ${this.keypair?.publicKey.toString()}`,
          addToResponse: true,
        };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private async createWallet(): Promise<void> {
    // Generate new keypair
    this.keypair = Keypair.generate();

    // Ensure directory exists
    const dir = path.dirname(this.walletPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save wallet data
    const walletData = {
      publicKey: this.keypair.publicKey.toBytes(),
      secretKey: Array.from(this.keypair.secretKey),
    };

    fs.writeFileSync(this.walletPath, JSON.stringify(walletData, null, 2));
    console.log(
      `[${
        this.metadata.name
      }] Created new wallet: ${this.keypair.publicKey.toString()}`
    );
  }

  getPublicKey(): string | null {
    return this.keypair ? this.keypair.publicKey.toString() : null;
  }

  hasWallet(): boolean {
    return this.keypair !== null;
  }
}
