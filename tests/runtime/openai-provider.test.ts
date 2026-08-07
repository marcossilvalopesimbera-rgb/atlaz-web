import test from "node:test";
import assert from "node:assert/strict";

import OpenAIProvider from "../../runtime/llm/OpenAIProvider";
import { AIProviderError } from "../../runtime/llm/aiErrors";

test("omits temperature for models without temperature support", async () => {
  let capturedParams: Record<string, unknown> | null = null;

  const provider = new OpenAIProvider({
    model: "gpt-5.5",
    timeoutMs: 100,
    client: {
      responses: {
        create: async (params) => {
          capturedParams = params as Record<string, unknown>;
          return { output_text: "CONNECTED" };
        },
      },
    },
  });

  const output = await provider.generate("system", "user", {
    requestId: "req-1",
    endpoint: "/api/runtime/test",
  });

  assert.equal(output, "CONNECTED");
  assert.ok(capturedParams);
  assert.equal(capturedParams?.temperature, undefined);
});

test("sends temperature when model supports it", async () => {
  let capturedParams: Record<string, unknown> | null = null;

  const provider = new OpenAIProvider({
    model: "gpt-4.1",
    timeoutMs: 100,
    client: {
      responses: {
        create: async (params) => {
          capturedParams = params as Record<string, unknown>;
          return { output_text: "CONNECTED" };
        },
      },
    },
  });

  await provider.generate("system", "user");
  assert.equal(capturedParams?.temperature, 0.2);
});

test("classifies timeout as AI_TIMEOUT", async () => {
  const provider = new OpenAIProvider({
    model: "gpt-5.5",
    timeoutMs: 10,
    client: {
      responses: {
        create: async (_params, options) => {
          return await new Promise((_, reject) => {
            options.signal.addEventListener("abort", () => {
              const abortError = new Error("The operation was aborted.");
              abortError.name = "AbortError";
              reject(abortError);
            });
          });
        },
      },
    },
  });

  await assert.rejects(
    provider.generate("system", "user"),
    (error: unknown) => {
      assert.ok(error instanceof AIProviderError);
      assert.equal(error.category, "AI_TIMEOUT");
      return true;
    }
  );
});

test("preserves provider HTTP details", async () => {
  const provider = new OpenAIProvider({
    model: "gpt-5.5",
    timeoutMs: 100,
    client: {
      responses: {
        create: async () => {
          throw {
            status: 400,
            type: "invalid_request_error",
            request_id: "req_openai_123",
            message: "Unsupported parameter: 'temperature'",
            error: {
              type: "invalid_request_error",
              code: "invalid_parameter",
              message: "Unsupported parameter: 'temperature'",
            },
          };
        },
      },
    },
  });

  await assert.rejects(
    provider.generate("system", "user", { requestId: "req-400" }),
    (error: unknown) => {
      assert.ok(error instanceof AIProviderError);
      assert.equal(error.category, "AI_CONFIGURATION");
      assert.equal(error.status, 400);
      assert.equal(error.providerErrorType, "invalid_request_error");
      assert.equal(error.providerErrorCode, "invalid_parameter");
      assert.equal(
        error.providerMessage,
        "Unsupported parameter: 'temperature' (request_id: req_openai_123)"
      );
      assert.equal(error.requestId, "req-400");
      return true;
    }
  );
});

test("fails fast for incompatible startup configuration", () => {
  const previous = process.env.OPENAI_TEMPERATURE;
  process.env.OPENAI_TEMPERATURE = "0.7";

  try {
    assert.throws(
      () =>
        new OpenAIProvider({
          model: "gpt-5.5",
          client: {
            responses: {
              create: async () => ({ output_text: "ok" }),
            },
          },
        }),
      (error: unknown) => {
        assert.ok(error instanceof AIProviderError);
        assert.equal(error.category, "AI_CONFIGURATION");
        assert.match(error.providerMessage, /does not support parameter 'temperature'/i);
        return true;
      }
    );
  } finally {
    if (previous === undefined) {
      delete process.env.OPENAI_TEMPERATURE;
    } else {
      process.env.OPENAI_TEMPERATURE = previous;
    }
  }
});
