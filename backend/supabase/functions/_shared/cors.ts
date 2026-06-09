// CORS — yalnız bilinen origin'lere izin verir.
// NOT: Bu fonksiyonlardaki ASIL koruma Authorization header'ındaki giriş
// token'ıdır (çerez değil), dolayısıyla CORS ek bir sertleştirmedir.
// Birden çok origin desteklemek için isteğin Origin'ini allowlist'e göre yansıtırız.

const ALLOWED_ORIGINS = [
  "https://applyze.vercel.app",
  "https://il9u.com",
  "https://www.il9u.com",
  "http://localhost:8081",
  "http://localhost:19006",
];

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  return null;
}
