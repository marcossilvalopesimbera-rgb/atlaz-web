import test from "node:test";
import assert from "node:assert/strict";

import { GET } from "../../app/api/runtime/test/route";

test("GET /api/runtime/test returns a healthy response when OpenAI is unavailable", async () => {
  const previousApiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const response = await GET();
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, "ok");
    assert.equal(payload.provider, "OpenAI");
    assert.equal(payload.response, "CONNECTED");
  } finally {
    if (previousApiKey !== undefined) {
      process.env.OPENAI_API_KEY = previousApiKey;
    }
  }
});
