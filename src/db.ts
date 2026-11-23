import { Pool } from "pg";

/**
 * Pool de conexões configurado por variáveis de ambiente:
 * DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD e DB_SSL ("true" habilita SSL).
 */
export function criarPool(): Pool {
  const usarSsl = (process.env.DB_SSL ?? "false").toLowerCase() === "true";

  return new Pool({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? "fatec",
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    ssl: usarSsl ? { rejectUnauthorized: false } : false,
  });
}
