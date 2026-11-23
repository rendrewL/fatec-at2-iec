import express, { type NextFunction, type Request, type Response, Router } from "express";
import type { ItemRepository } from "./repository";

export interface Dependencias {
  alunos: ItemRepository;
  disciplinas: ItemRepository;
}

function criarRotasDeItens(repo: ItemRepository): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await repo.listar());
    } catch (erro) {
      next(erro);
    }
  });

  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nome: unknown = req.body?.nome;
      if (typeof nome !== "string" || nome.trim() === "" || nome.trim().length > 120) {
        res.status(400).json({ erro: "Informe 'nome' como texto de 1 a 120 caracteres." });
        return;
      }
      res.status(201).json(await repo.criar(nome.trim()));
    } catch (erro) {
      next(erro);
    }
  });

  return router;
}

export function criarApp({ alunos, disciplinas }: Dependencias) {
  const app = express();
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.type("text/plain").send("Bem-vindo a primeira aula de IEC da FATEC!");
  });

  // Usada pelo Render (Health Check Path). Não depende do banco de dados.
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: Math.floor(process.uptime()) });
  });

  app.use("/alunos", criarRotasDeItens(alunos));
  app.use("/disciplinas", criarRotasDeItens(disciplinas));

  app.use((_req, res) => {
    res.status(404).json({ erro: "Rota não encontrada." });
  });

  app.use((erro: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(erro);
    res.status(500).json({ erro: "Erro interno do servidor." });
  });

  return app;
}
