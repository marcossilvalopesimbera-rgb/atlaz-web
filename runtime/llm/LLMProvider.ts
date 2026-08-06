export interface LLMProviderMetadata {
  provider: string;
  model: string;
}

export interface LLMProvider {
  generate(systemInstruction: string, userInput: string): Promise<string>;
  getMetadata(): LLMProviderMetadata;
}