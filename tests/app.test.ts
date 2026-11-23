import request from "supertest";
import { describe, expect, it } from "vitest";
import { criarApp } from "../src/app";
import type { Item, ItemRepository } from "../src/repository";

function repositorioEmMemoria(inicial: string[]): ItemRepository {
  const itens: Item[] = inicial.map((nome, i) => ({ id: i + 1, nome }));
  return {
    async listar() {
      return [...itens];
    },
    async criar(nome) {
      const item = { id: itens.length + 1, nome };
      itens.push(item);
      return item;
    },
  };
}

function novoApp() {
  return criarApp({
    alunos: repositorioEmMemoria(["João da Silva", "Maria Oliveira"]),
    disciplinas: repositorioEmMemoria(["Inglês I"]),
  });
}

describe("API", () => {
  it("GET /api/health retorna 200 com status ok e uptime numérico", async () => {
    const res = await request(novoApp()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
  });

  it("GET / retorna a mensagem de boas-vindas", async () => {
    const res = await request(novoApp()).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Bem-vindo a primeira aula de IEC da FATEC!");
  });

  it("GET /alunos lista os alunos", async () => {
    const res = await request(novoApp()).get("/alunos");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("POST /alunos cria e persiste um aluno", async () => {
    const app = novoApp();
    const criado = await request(app).post("/alunos").send({ nome: "Ana Souza" });
    expect(criado.status).toBe(201);
    expect(criado.body).toMatchObject({ nome: "Ana Souza" });

    const lista = await request(app).get("/alunos");
    expect(lista.body).toHaveLength(3);
  });

  it("POST /alunos sem nome retorna 400", async () => {
    const res = await request(novoApp()).post("/alunos").send({});
    expect(res.status).toBe(400);
  });

  it("GET /disciplinas lista as disciplinas", async () => {
    const res = await request(novoApp()).get("/disciplinas");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, nome: "Inglês I" }]);
  });

  it("rota inexistente retorna 404", async () => {
    const res = await request(novoApp()).get("/nao-existe");
    expect(res.status).toBe(404);
  });
});
