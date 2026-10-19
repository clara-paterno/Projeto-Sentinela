import type { Request, Response } from "express";
import { criarSolicitacaoService } from "../services/solicitacao.services.js";
import { criarSolicitacaoSchema } from "../schemas/solicitacao.schema.js";

export async function criarSolicitacao(req: Request, res: Response) {
  const validacao = criarSolicitacaoSchema.safeParse(req.body);

  if (!validacao.success) {
    res.status(400).json({
      mensagem: "Dados inválidos",
      erros: validacao.error.flatten()
    });
    return;
  }

  const resultado = await criarSolicitacaoService(validacao.data);

  res.status(201).json(resultado);
}