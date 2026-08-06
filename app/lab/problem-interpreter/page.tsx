"use client";

import { useState } from "react";

export default function ProblemInterpreterLabPage() {
  const [problem, setProblem] = useState(
    "Estamos com aumento de scrap após a troca do fornecedor da chapa de aço. O problema começou na última segunda-feira e afeta principalmente a linha 2."
  );
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInterpret = async (): Promise<void> => {
    setIsLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/runtime/problem-interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem,
        }),
      });

      const data = (await response.json()) as unknown;

      if (!response.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
            ? (data as { message: string }).message
            : "A requisição falhou";

        setResult(`Erro:\n${message}`);
        return;
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(error instanceof Error ? `Erro:\n${error.message}` : "Erro:\nErro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>ATLAZ Runtime Lab</h1>
      <p>Interpretador de Problema v1.0</p>

      <textarea
        rows={8}
        cols={80}
        value={problem}
        onChange={(event) => setProblem(event.target.value)}
        placeholder="Descreva um problema operacional..."
      />

      <div>
        <button type="button" onClick={handleInterpret} disabled={isLoading}>
          {isLoading ? "Interpretando..." : "Interpretar"}
        </button>
      </div>

      <h2>Resposta</h2>
      <pre>{result}</pre>
    </main>
  );
}
