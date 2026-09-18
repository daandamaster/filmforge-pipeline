async function ffHealth() {
  const res = await fetch("/api/health");
  return res.json().catch(() => ({ ok: false }));
}

async function ffGemini(prompt) {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ("HTTP " + res.status));
  return data.text || "";
}
