import type { Pool } from "pg";

export interface Item {
  id: number;
  nome: string;
}

export interface ItemRepository {
  listar(): Promise<Item[]>;
  criar(nome: string): Promise<Item>;
}

export type Tabela = "alunos" | "disciplinas";

const SEEDS: Record<Tabela, string[]> = {
  alunos: ["João da Silva", "Maria Oliveira", "Pedro Martins"],
  disciplinas: [
    "Gestão Ágil de Projetos de Software",
    "Algoritmo e Lógica de Programação",
    "Inglês I",
  ],
};

/** Cria as tabelas (se não existirem) e popula dados iniciais quando vazias. */
export async function inicializarBanco(pool: Pool): Promise<void> {
  for (const tabela of Object.keys(SEEDS) as Tabela[]) {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${tabela} (
         id SERIAL PRIMARY KEY,
         nome VARCHAR(120) NOT NULL
       )`,
    );
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS total FROM ${tabela}`);
    if (rows[0].total === 0) {
      for (const nome of SEEDS[tabela]) {
        await pool.query(`INSERT INTO ${tabela} (nome) VALUES ($1)`, [nome]);
      }
    }
  }
}

/** Repositório PostgreSQL. O nome da tabela vem de um tipo fechado (sem entrada do usuário). */
export function criarRepositorioPg(pool: Pool, tabela: Tabela): ItemRepository {
  return {
    async listar() {
      const { rows } = await pool.query<Item>(`SELECT id, nome FROM ${tabela} ORDER BY id`);
      return rows;
    },
    async criar(nome) {
      const { rows } = await pool.query<Item>(
        `INSERT INTO ${tabela} (nome) VALUES ($1) RETURNING id, nome`,
        [nome],
      );
      return rows[0];
    },
  };
}
