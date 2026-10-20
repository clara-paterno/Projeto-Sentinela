import type { Request, Response } from "express";

import {
  criarSolicitacaoService,
  consultarSolicitacaoService
} from "../services/solicitacao.services.js";

import { criarSolicitacaoSchema } from "../schemas/solicitacao.schema.js";
import { consultarSolicitacaoSchema } from "../schemas/consulta.schema.js";

export async function criarSolicitacao(
  req: Request,
  res: Response
) {
  const validacao = criarSolicitacaoSchema.safeParse(req.body);

  if (!validacao.success) {
    res.status(400).json({
      mensagem: "Dados inválidos",
      erros: validacao.error.flatten()
    });
    return;
  }

  try {
    const resultado = await criarSolicitacaoService(
      validacao.data
    );

    res.status(201).json(resultado);
  } catch (erro) {
    if (
      erro instanceof Error &&
      erro.message === "Categoria inválida para esta solicitação"
    ) {
      res.status(400).json({
        mensagem: erro.message
      });
      return;
    }

    throw erro;
  }
}

export async function consultarSolicitacao(
  req: Request,
  res: Response
) {
  const validacao = consultarSolicitacaoSchema.safeParse(req.body);

  if (!validacao.success) {
    res.status(400).json({
      mensagem: "Dados de consulta inválidos",
      erros: validacao.error.flatten()
    });
    return;
  }

  const resultado = await consultarSolicitacaoService(
    validacao.data
  );

  if (!resultado) {
    res.status(404).json({
      mensagem: "Protocolo ou código de consulta inválido"
    });
    return;
  }

  res.status(200).json(resultado);
}