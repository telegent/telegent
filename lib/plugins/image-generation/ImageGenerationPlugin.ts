import OpenAI from "openai";
import { BasePlugin } from "../../components/plugin/BasePlugin";
import { Plugin, PluginCapability, PluginResponse } from "../../types/plugin";
import { Telegent } from "../../Telegent";
import { TelegentConfig } from "../../types/config";

export class ImageGenerationPlugin extends BasePlugin implements Plugin {
  private openai: OpenAI;
  private bot: Telegent | null = null;
  public capabilities: PluginCapability[];

  constructor(config: TelegentConfig) {
    super({
      name: "image-generation",
      description:
        "Generate images using DALL-E 3 using the message of the user as the prompt",
      version: "1.0.0",
      author: "Telegent",
    });

    this.openai = new OpenAI({ apiKey: config.openai?.apiKey });

    this.capabilities = [
      {
        name: "generate",
        description: "Generate an image based on a text prompt using DALL-E 3",
        examples: [
          "generate a serene landscape with mountains and a lake at sunset",
          "generate a futuristic cityscape at night with flying cars",
          "create an image",
          "show me an image",
        ],
      },
      {
        name: "generate-hd",
        description:
          "Generate a high-definition (1024x1024) image based on a text prompt",
        examples: [
          "high definition portrait of a cyberpunk character",
          "generate a high definition of an intricate steampunk machine with brass gears",
        ],
      },
    ];
  }

  async onLoad(bot: Telegent): Promise<void> {
    this.bot = bot;
  }

  async execute(action: string, params: string[]): Promise<PluginResponse> {
    if (!this.bot) {
      throw new Error("Plugin not properly initialized");
    }

    if (!["generate", "generate-hd"].includes(action)) {
      return {
        result: "Invalid action. Available actions: generate, generate-hd",
        addToResponse: true,
      };
    }

    const prompt = params.join(" ");
    if (!prompt) {
      return {
        result: "Please provide a prompt for image generation",
        addToResponse: true,
      };
    }

    try {
      const size = action === "generate-hd" ? "1024x1024" : "1024x1024";

      console.log(prompt);

      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size,
        quality: action === "generate-hd" ? "hd" : "standard",
        style: "natural",
      });

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        throw new Error("No image URL received from DALL-E");
      }

      console.log(imageUrl);

      return {
        result: imageUrl,
        addToResponse: true,
      };
    } catch (error) {
      console.error("Error generating image:", error);

      // Provide more specific error messages based on common issues
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          return {
            result: "Rate limit exceeded. Please try again later.",
            addToResponse: true,
          };
        }
        if (error.status === 400) {
          return {
            result:
              "Invalid prompt. Please try a different prompt that complies with content policy.",
            addToResponse: true,
          };
        }
      }

      return {
        result: "Failed to generate image. Please try again later.",
        addToResponse: true,
      };
    }
  }

  async onUnload(): Promise<void> {
    // Cleanup if needed
  }

  async onError(error: Error): Promise<void> {
    console.error("ImageGenerationPlugin error:", error);
  }
}
