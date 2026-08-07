export interface LLMProviderMetadata {
  provider: string;
  model: string;
}

export interface LLMRequestContext {
  requestId?: string;
  investigationId?: string;
  endpoint?: string;
  retryCount?: number;
}

export interface LLMProvider {
  generate(systemInstruction: string, userInput: string, context?: LLMRequestContext): Promise<string>;
  getMetadata(): LLMProviderMetadata;
}