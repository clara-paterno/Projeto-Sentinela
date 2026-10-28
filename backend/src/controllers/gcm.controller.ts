import type { Request, Response } from "express";
import { z } from "zod";

import { atualizarStatusSchema } from "../schemas/status.schema.js";
import { atualizarStatusGcmService } from "../services/gcm.services.js";

import {
  listarSolicitacoesGcmService,
  detalharSolicitacaoGcmService,
} from "../services/gcm.services.js";

const filtrosGcmSchema = z
  .object({
    categoriaId: z.uuid().optional(),

    tipo: z.enum(["DENUNCIA", "OCORRENCIA"]).optional(),
    pagina: z.coerce.number().int().min(1).default(1),
    limite: z.coerce.number().int().min(1).max(50).default(10),

    status: z
      .string()
      .transform((valor) => valor.split(",").map((s) => s.trim()))
      .pipe(
        z
          .array(
            z.enum([
              "RECEBIDA",
              "EM_ANALISE",
              "EM_ATENDIMENTO",
              "CONCLUIDA",
              "ENCERRADA_SEM_ATENDIMENTO",
            ]),
          )
          .min(1),
      )
      .optional(),

    dataInicio: z.iso.date().optional(),
    dataFim: z.iso.date().optional(),
  })
  .refine(
    (dados) =>
      !dados.dataInicio || !dados.dataFim || dados.dataInicio <= dados.dataFim,
    {
      message: "Intervalo de datas inválido",
      path: ["dataFim"],
    },
  );

export async function listarSolicitacoesGcm(req: Request, res: Response) {
  const validacao = filtrosGcmSchema.safeParse(req.query);

  if (!validacao.success) {
    res.status(400).json({
      mensagem: "Filtros inválidos",
      erros: validacao.error.flatten(),
    });
    return;
  }

  const { categoriaId, tipo, status, dataInicio, dataFim, pagina, limite } =
    validacao.data;

  const resultado = await listarSolicitacoesGcmService({
    categoriaId,
    tipo,
    status,
    pagina,
    limite,
    dataInicio: dataInicio
      ? new Date(`${dataInicio}T00:00:00.000Z`)
      : undefined,
    dataFim: dataFim ? new Date(`${dataFim}T23:59:59.999Z`) : undefined,
  });

  res.status(200).json(resultado);
}

export async function detalharSolicitacaoGcm(req: Request, res: Response) {
  const validacao = z.uuid().safeParse(req.params.id);

  if (!validacao.success) {
    res.status(400).json({
      mensagem: "ID da solicitação inválido",
    });
    return;
  }

  const solicitacao = await detalharSolicitacaoGcmService(validacao.data);

  if (!solicitacao) {
    res.status(404).json({
      mensagem: "Solicitação não encontrada",
    });
    return;
  }

  res.status(200).json(solicitacao);
}

export async function atualizarStatusGcm(req: Request, res: Response) {
  const idValidado = z.uuid().safeParse(req.params.id);

  if (!idValidado.success) {
    res.status(400).json({
      mensagem: "ID da solicitação inválido",
    });
    return;
  }

  const validacao = atualizarStatusSchema.safeParse(req.body);

  if (!validacao.success) {
    res.status(400).json({
      mensagem: "Dados de atualização inválidos",
      erros: validacao.error.flatten(),
    });
    return;
  }

  const agenteId = res.locals.agenteId as string;

  const resultado = await atualizarStatusGcmService(
    idValidado.data,
    agenteId,
    validacao.data,
  );

  if ("erro" in resultado) {
    if (resultado.erro === "NAO_ENCONTRADA") {
      res.status(404).json({
        mensagem: "Solicitação não encontrada",
      });
      return;
    }

    res.status(409).json({
      mensagem: "Transição de status não permitida",
    });
    return;
  }

  res.status(200).json(resultado.solicitacao);
}
