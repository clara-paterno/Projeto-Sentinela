
import type { Request, Response } from "express";
import { z } from "zod";

import { atualizarStatusSchema } from "../schemas/status.schema.js";
import { atualizarStatusGcmService } from "../services/gcm.services.js";


import {
  listarSolicitacoesGcmService,
  detalharSolicitacaoGcmService
} from "../services/gcm.services.js";

export async function listarSolicitacoesGcm(
  req: Request,
  res: Response
) {
  const solicitacoes = await listarSolicitacoesGcmService();

  res.status(200).json(solicitacoes);
}

export async function detalharSolicitacaoGcm(
  req: Request,
  res: Response
) {
  const validacao = z.uuid().safeParse(req.params.id);

  if (!validacao.success) {
    res.status(400).json({
      mensagem: "ID da solicitação inválido"
    });
    return;
  }

  const solicitacao = await detalharSolicitacaoGcmService(
    validacao.data
  );

  if (!solicitacao) {
    res.status(404).json({
      mensagem: "Solicitação não encontrada"
    });
    return;
  }

  res.status(200).json(solicitacao);
}


export async function atualizarStatusGcm(
  req: Request,
  res: Response
) {
  const idValidado = z.uuid().safeParse(req.params.id);

  if (!idValidado.success) {
    res.status(400).json({
      mensagem: "ID da solicitação inválido"
    });
    return;
  }

  const validacao = atualizarStatusSchema.safeParse(req.body);

  if (!validacao.success) {
    res.status(400).json({
      mensagem: "Dados de atualização inválidos",
      erros: validacao.error.flatten()
    });
    return;
  }

  const agenteId = res.locals.agenteId as string;

  const resultado = await atualizarStatusGcmService(
    idValidado.data,
    agenteId,
    validacao.data
  );

  if ("erro" in resultado) {
    if (resultado.erro === "NAO_ENCONTRADA") {
      res.status(404).json({
        mensagem: "Solicitação não encontrada"
      });
      return;
    }

    res.status(409).json({
      mensagem: "Transição de status não permitida"
    });
    return;
  }

  res.status(200).json(resultado.solicitacao);
}

