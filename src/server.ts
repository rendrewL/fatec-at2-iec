import { criarApp } from "./app";
import { criarPool } from "./db";
import { criarRepositorioPg, inicializarBanco } from "./repository";

const PORT = Number(process.env.PORT || 3000);

async function main() {
  const pool = criarPool();
  await inicializarBanco(pool);

  const app = criarApp({
    alunos: criarRepositorioPg(pool, "alunos"),
    disciplinas: criarRepositorioPg(pool, "disciplinas"),
  });

  const server = app.listen(PORT, () => {
    console.log(`API ouvindo na porta ${PORT}`);
  });

  const encerrar = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on("SIGTERM", encerrar);
  process.on("SIGINT", encerrar);
}

main().catch((erro) => {
  console.error("Falha ao iniciar a aplicação:", erro);
  process.exit(1);
});
