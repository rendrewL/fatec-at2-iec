
import type { Pool } from "pg";

export interface Item {
  id: number;
  nome: string;
}

export interface ItemRepository {
  listar(): Promise<Item[]>;
  criar(nome: string): Promise<Item>;
  atualizar(id: number, nome: string): Promise<Item | null>;
  excluir(id: number): Promise<boolean>;
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

/** Cria as tabelas e insere dados iniciais quando estiverem vazias. */
export async function inicializarBanco(pool: Pool): Promise<void> {
  for (const tabela of Object.keys(SEEDS) as Tabela[]) {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ${tabela} (
         id SERIAL PRIMARY KEY,
         nome VARCHAR(120) NOT NULL
       )`,
    );

    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM ${tabela}`,
    );

    if (rows[0].total === 0) {
      for (const nome of SEEDS[tabela]) {
        await pool.query(
          `INSERT INTO ${tabela} (nome) VALUES ($1)`,
          [nome],
        );
      }
    }
  }
}

/** Repositório PostgreSQL com operações CRUD. */
export function criarRepositorioPg(
  pool: Pool,
  tabela: Tabela,
): ItemRepository {
  return {
    async listar() {
      const { rows } = await pool.query<Item>(
        `SELECT id, nome FROM ${tabela} ORDER BY id`,
      );
      return rows;
    },

    async criar(nome) {
      const { rows } = await pool.query<Item>(
        `INSERT INTO ${tabela} (nome) VALUES ($1) RETURNING id, nome`,
        [nome],
      );
      return rows[0];
    },

    async atualizar(id, nome) {
      const { rows } = await pool.query<Item>(
        `UPDATE ${tabela}
         SET nome = $1
         WHERE id = $2
         RETURNING id, nome`,
        [nome, id],
      );

      return rows[0] ?? null;
    },

    async excluir(id) {
      const resultado = await pool.query(
        `DELETE FROM ${tabela} WHERE id = $1`,
        [id],
      );

      return (resultado.rowCount ?? 0) > 0;
    },
  };
}
