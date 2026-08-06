import OpenAIProvider from "../runtime/llm/OpenAIProvider";

async function main(): Promise<void> {
  try {
    const provider = new OpenAIProvider();
    const response = await provider.generate(
      "You are a test assistant. Reply with exactly the word CONNECTED.",
      "Test"
    );

    console.log(response.trim());
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return;
    }

    console.error("Unknown error while testing OpenAI connectivity");
  }
}

void main();
