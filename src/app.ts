import express, { type NextFunction, type Request, type Response, Router } from "express";
import type { ItemRepository } from "./repository";
import cors from "cors";

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


  router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const nome: unknown = req.body?.nome;

      if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({ erro: "ID inválido." });
        return;
      }

      if (
        typeof nome !== "string" ||
        nome.trim().length === 0 ||
        nome.trim().length > 120
      ) {
        res.status(400).json({
          erro: "Informe 'nome' como texto de 1 a 120 caracteres.",
        });
        return;
      }

      const item = await repo.atualizar(id, nome.trim());

      if (!item) {
        res.status(404).json({ erro: "Registro não encontrado." });
        return;
      }

      res.json(item);
    } catch (erro) {
      next(erro);
    }
  });

  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({ erro: "ID inválido." });
        return;
      }

      const excluido = await repo.excluir(id);

      if (!excluido) {
        res.status(404).json({ erro: "Registro não encontrado." });
        return;
      }

      res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  });


  return router;
}

export function criarApp({ alunos, disciplinas }: Dependencias) {
  const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

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
