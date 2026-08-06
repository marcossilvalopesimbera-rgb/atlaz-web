import OpenAI from "openai";
import { LLMProvider, LLMProviderMetadata } from "./LLMProvider";

export default class OpenAIProvider implements LLMProvider {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error("Missing OPENAI_API_KEY environment variable");
    }

    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL?.trim() || "gpt-5.5";
    this.timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || "20000");
  }

  public getMetadata(): LLMProviderMetadata {
    return {
      provider: "openai",
      model: this.model,
    };
  }

  public async generate(systemInstruction: string, userInput: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.client.responses.create({
        model: this.model,
        temperature: 0.2,
        input: [
          {
            role: "system",
            content: systemInstruction,
          },
          {
            role: "user",
            content: userInput,
          },
        ],
      }, {
        signal: controller.signal,
      });

      const text = response.output_text?.trim();

      if (!text) {
        throw new Error("OpenAI returned an empty response");
      }

      return text;
    } catch (error) {
      if (error instanceof Error && error.message === "OpenAI returned an empty response") {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("LLM request timed out");
      }

      throw new Error("OpenAI request failed");
    } finally {
      clearTimeout(timeout);
    }
  }
}