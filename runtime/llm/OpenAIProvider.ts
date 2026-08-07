import OpenAI from "openai";
import { resolveModelCapabilities } from "./aiCapabilities";
import { AIProviderError, toAIProviderError } from "./aiErrors";
import { logAIRequestFailure, logAIRequestSuccess } from "./aiObservability";
import { getConfiguredOpenAITemperature, validateOpenAIConfiguration } from "./providerValidation";
import { LLMProvider, LLMProviderMetadata, LLMRequestContext } from "./LLMProvider";

type OpenAIResponsesClient = Pick<OpenAI, "responses">;

type OpenAIProviderOptions = {
  client?: OpenAIResponsesClient;
  model?: string;
  timeoutMs?: number;
};

const getNonEmptyString = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
};

export default class OpenAIProvider implements LLMProvider {
  private readonly client: OpenAIResponsesClient;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly temperature?: number;

  constructor(options: OpenAIProviderOptions = {}) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!options.client && (!apiKey || apiKey.trim().length === 0)) {
      throw new Error("Missing OPENAI_API_KEY environment variable");
    }

    this.client = options.client ?? new OpenAI({ apiKey });
    this.model = options.model ?? (process.env.OPENAI_MODEL?.trim() || "gpt-5.5");
    this.timeoutMs = options.timeoutMs ?? Number(process.env.OPENAI_TIMEOUT_MS || "20000");
    this.temperature = getConfiguredOpenAITemperature() ?? 0.2;

    validateOpenAIConfiguration(this.model);
  }

  public getMetadata(): LLMProviderMetadata {
    return {
      provider: "openai",
      model: this.model,
    };
  }

  public async generateWithMetadata(
    systemInstruction: string,
    userInput: string,
    context: LLMRequestContext = {}
  ): Promise<{
    text: string;
    tokenUsage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
    finishReason?: string;
  }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    const startedAt = Date.now();
    const capabilities = resolveModelCapabilities(this.model);

    const requestPayload: {
      model: string;
      input: Array<{ role: "system" | "user"; content: string }>;
      temperature?: number;
    } = {
      model: this.model,
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
    };

    if (capabilities.supportsTemperature && this.temperature !== undefined) {
      requestPayload.temperature = this.temperature;
    }

    try {
      const response = await this.client.responses.create(requestPayload, {
        signal: controller.signal,
      });

      const text = response.output_text?.trim();

      if (!text) {
        throw new AIProviderError({
          category: "AI_INVALID_RESPONSE",
          provider: "openai",
          model: this.model,
          requestId: context.requestId,
          endpoint: context.endpoint,
          providerMessage: "OpenAI returned an empty response",
          providerErrorType: "empty_response",
        });
      }

      logAIRequestSuccess({
        timestamp: new Date().toISOString(),
        requestId: context.requestId,
        investigationId: context.investigationId,
        provider: "openai",
        model: this.model,
        endpoint: context.endpoint,
        durationMs: Date.now() - startedAt,
        retryCount: context.retryCount ?? 0,
      });

      return {
        text,
        tokenUsage: {
          inputTokens: response.usage?.input_tokens,
          outputTokens: response.usage?.output_tokens,
          totalTokens: response.usage?.total_tokens,
        },
        finishReason: (response.output?.[0] as { finish_reason?: string } | undefined)?.finish_reason,
      };
    } catch (error) {
      const normalizedError = toAIProviderError(error, {
        provider: "openai",
        model: this.model,
        requestId: context.requestId,
        endpoint: context.endpoint,
      });

      const upstreamRequestId = getNonEmptyString(
        (error as { request_id?: unknown } | null | undefined)?.request_id
      );

      const propagatedError =
        upstreamRequestId && !normalizedError.providerMessage.includes("request_id:")
          ? new AIProviderError({
              category: normalizedError.category,
              provider: normalizedError.provider,
              model: normalizedError.model,
              requestId: normalizedError.requestId,
              endpoint: normalizedError.endpoint,
              status: normalizedError.status,
              providerErrorType: normalizedError.providerErrorType,
              providerErrorCode: normalizedError.providerErrorCode,
              providerMessage: `${normalizedError.providerMessage} (request_id: ${upstreamRequestId})`,
              cause: normalizedError.cause,
            })
          : normalizedError;

      logAIRequestFailure(
        {
          timestamp: new Date().toISOString(),
          requestId: context.requestId,
          investigationId: context.investigationId,
          provider: "openai",
          model: this.model,
          endpoint: context.endpoint,
          durationMs: Date.now() - startedAt,
          retryCount: context.retryCount ?? 0,
        },
        propagatedError
      );

      throw propagatedError;
    } finally {
      clearTimeout(timeout);
    }
  }

  public async generate(systemInstruction: string, userInput: string, context: LLMRequestContext = {}): Promise<string> {
    const result = await this.generateWithMetadata(systemInstruction, userInput, context);
    return result.text;
  }
}