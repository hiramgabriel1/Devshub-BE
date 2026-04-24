const PRODUCTION_FRONTEND_ORIGINS = ['https://www.devshub.dev'] as const;

export function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  const fromEnv = raw
    ? raw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : ['http://localhost:3000'];
  return [...new Set([...PRODUCTION_FRONTEND_ORIGINS, ...fromEnv])];
}
