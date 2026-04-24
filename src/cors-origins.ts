/** Orígenes permitidos: `CORS_ORIGIN` separada por comas, o `http://localhost:3000` por defecto. */
export function getCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) {
    return ['http://localhost:3000'];
  }
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}
