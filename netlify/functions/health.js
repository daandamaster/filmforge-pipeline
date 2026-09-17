export default async () => {
  const hasKey = Boolean(
    Netlify.env.get("GEMINI_API_KEY") || Netlify.env.get("GOOGLE_API_KEY")
  );
  return new Response(
    JSON.stringify({
      ok: true,
      service: "filmforge-pipeline",
      gemini: hasKey
    }),
    {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};

export const config = {
  path: "/api/health"
};
