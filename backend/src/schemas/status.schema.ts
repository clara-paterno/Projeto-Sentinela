
import { z } from "zod";

export const atualizarStatusSchema = z.object({
  status: z.enum([
    "RECEBIDA",
    "EM_ANALISE",
    "EM_ATENDIMENTO",
    "CONCLUIDA",
    "ENCERRADA_SEM_ATENDIMENTO"
  ]),
  observacao: z.string().trim().max(1000).optional()
}).superRefine((dados, ctx) => {
  if (
    dados.status === "ENCERRADA_SEM_ATENDIMENTO" &&
    !dados.observacao
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["observacao"],
      message: "Justificativa obrigatória para encerramento sem atendimento"
    });
  }
});

export type AtualizarStatusInput = z.infer<
  typeof atualizarStatusSchema
>;
