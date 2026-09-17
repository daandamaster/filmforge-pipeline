export default async (req: Request) => {
  if (req.method === "GET") {
    const hasKey = Boolean(
      Netlify.env.get("GEMINI_API_KEY") || Netlify.env.get("GOOGLE_API_KEY")
    );
    return Response.json({ ok: true, service: "filmforge-gemini", hasKey });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405 });
  }

  const key =
    Netlify.env.get("GEMINI_API_KEY") || Netlify.env.get("GOOGLE_API_KEY") || "";
  if (!key) {
    return Response.json({ error: "missing_gemini_api_key" }, { status: 503 });
  }

  let body: { prompt?: string; model?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    return Response.json({ error: "missing_prompt" }, { status: 400 });
  }
  if (prompt.length > 8000) {
    return Response.json({ error: "prompt_too_long" }, { status: 413 });
  }

  const model = String(body.model || "gemini-flash-latest").replace(/[^a-zA-Z0-9._-]/g, "");
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    model +
    ":generateContent";

  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": key,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return Response.json(
      { error: "upstream_error", status: upstream.status },
      { status: 502 }
    );
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || "")
      .join("") || "";

  return Response.json({
    text,
    model: data?.modelVersion || model,
  });
};

export const config = {
  path: "/api/gemini",
};
