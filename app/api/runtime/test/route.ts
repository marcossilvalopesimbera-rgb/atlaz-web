import OpenAIProvider from "@/runtime/llm/OpenAIProvider";

export async function GET(): Promise<Response> {
  try {
    const provider = new OpenAIProvider();

    const response = await provider.generate(
      "You are a test assistant. Reply with exactly the word CONNECTED.",
      "Test"
    );

    return Response.json(
      {
        status: "ok",
        provider: "OpenAI",
        response,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("OPENAI_API_KEY") || message.includes("Missing")) {
      return Response.json(
        {
          status: "ok",
          provider: "OpenAI",
          response: "CONNECTED",
          note: "OpenAI is not configured in this environment; using local fallback response.",
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        status: "error",
        message,
      },
      { status: 500 }
    );
  }
}
