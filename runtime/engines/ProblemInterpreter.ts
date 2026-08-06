import { OperationalObject } from "../artifacts/OperationalObject";
import { LLMProvider } from "../llm/LLMProvider";
import { ProblemInterpreterPolicy } from "../policies/ProblemInterpreterPolicy";
import { validateOrRecoverOperationalObject } from "../schemas/OperationalObjectRecovery";

const RETRY_DELAYS_MS = [800, 1500] as const;
const MAX_ATTEMPTS = 3;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

type InterpretContext = {
  requestId?: string;
};

export default class ProblemInterpreter {
  constructor(private readonly provider: LLMProvider) {}

  public async interpret(problemStatement: string, context: InterpretContext = {}): Promise<OperationalObject> {
    const providerMetadata = this.provider.getMetadata();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const startedAt = Date.now();

      try {
        const rawResponse = await this.provider.generate(ProblemInterpreterPolicy, problemStatement);

        if (!rawResponse || rawResponse.trim().length === 0) {
          throw new Error("LLM returned an empty response");
        }

        const validatedObject = validateOrRecoverOperationalObject(rawResponse, problemStatement);

        return validatedObject;
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error("Unknown LLM execution error");
        lastError = normalizedError;

        this.logFailure({
          requestId: context.requestId,
          attempt,
          responseTimeMs: Date.now() - startedAt,
          provider: providerMetadata.provider,
          model: providerMetadata.model,
          prompt: {
            systemInstruction: ProblemInterpreterPolicy,
            userInput: problemStatement,
          },
          schema: "OperationalObjectSchema",
          errorMessage: normalizedError.message,
          stack: normalizedError.stack,
          timestamp: new Date().toISOString(),
        });

        if (attempt < MAX_ATTEMPTS) {
          await wait(RETRY_DELAYS_MS[attempt - 1]);
        }
      }
    }

    this.logFailure({
      requestId: context.requestId,
      attempt: MAX_ATTEMPTS,
      responseTimeMs: 0,
      provider: providerMetadata.provider,
      model: providerMetadata.model,
      prompt: {
        systemInstruction: ProblemInterpreterPolicy,
        userInput: problemStatement,
      },
      schema: "OperationalObjectSchema",
      errorMessage: "All interpretation attempts failed",
      stack: lastError?.stack,
      timestamp: new Date().toISOString(),
    });

    throw new Error("INTERPRETATION_TEMPORARY_UNAVAILABLE");
  }

  private logFailure(payload: {
    requestId?: string;
    attempt: number;
    responseTimeMs: number;
    provider: string;
    model: string;
    prompt: {
      systemInstruction: string;
      userInput: string;
    };
    schema: string;
    errorMessage: string;
    stack?: string;
    timestamp: string;
  }): void {
    console.error(
      "[ATLAZ][ProblemInterpreter][LLMFailure]",
      JSON.stringify(payload)
    );
  }
}