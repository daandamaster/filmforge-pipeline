export default async (req) => {
  const json = (status, body) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json; charset=utf-8" }
    });

  if (req.method === "OPTIONS") return new Response("", { status: 204 });
  if (req.method !== "POST") return json(405, { error: "POST only" });

  const key = Netlify.env.get("GEMINI_API_KEY") || Netlify.env.get("GOOGLE_API_KEY");
  if (!key) return json(503, { error: "GEMINI_API_KEY missing" });

  let payload = {};
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "JSON body required" });
  }

  const text = String(payload.text || payload.prompt || "").trim().slice(0, 4000);
  if (!text) return json(400, { error: "text required" });

  const model = String(payload.model || "gemini-flash-latest").replace(/[^a-z0-9._-]/gi, "") || "gemini-flash-latest";
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";

  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": key
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }]
    })
  });

  const raw = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return json(upstream.status, {
      error: raw.error?.message || "Gemini upstream error",
      status: upstream.status
    });
  }

  const out =
    raw.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

  return json(200, {
    text: out,
    model: raw.modelVersion || model,
    usage: raw.usageMetadata || null
  });
};

export const config = {
  path: "/api/gemini"
};
