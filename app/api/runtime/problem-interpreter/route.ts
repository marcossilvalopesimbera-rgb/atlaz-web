import ProblemInterpreter from "@/runtime/engines/ProblemInterpreter";
import OpenAIProvider from "@/runtime/llm/OpenAIProvider";

interface ProblemInterpreterRequest {
  problem: string;
}

const isValidProblem = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      {
        status: "error",
        message: "Não foi possível iniciar a investigação.",
      },
      {
        status: 400,
        headers: {
          "X-Request-ID": requestId,
        },
      }
    );
  }

  const problem = (payload as ProblemInterpreterRequest)?.problem;

  if (!isValidProblem(problem)) {
    return Response.json(
      {
        status: "error",
        message: "Não foi possível iniciar a investigação.",
      },
      {
        status: 400,
        headers: {
          "X-Request-ID": requestId,
        },
      }
    );
  }

  try {
    const provider = new OpenAIProvider();
    const interpreter = new ProblemInterpreter(provider);
    const operationalObject = await interpreter.interpret(problem, {
      requestId,
    });

    return Response.json(operationalObject, {
      status: 200,
      headers: {
        "X-Request-ID": requestId,
      },
    });
  } catch (error) {
    console.error(
      "[ATLAZ][ProblemInterpreter][RouteFailure]",
      JSON.stringify({
        requestId,
        timestamp: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      })
    );

    return Response.json(
      {
        status: "error",
        message: "Não foi possível concluir a interpretação inicial no momento.",
      },
      {
        status: 503,
        headers: {
          "X-Request-ID": requestId,
        },
      }
    );
  }
}
