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

    return Response.json(
      {
        status: "error",
        message,
      },
      { status: 500 }
    );
  }
}
