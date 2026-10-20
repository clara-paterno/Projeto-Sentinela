import { z } from "zod";

export const consultarSolicitacaoSchema = z.object({
  protocolo: z.uuid(),
  codigoConsulta: z.string().regex(/^[a-fA-F0-9]{48}$/)
});

export type ConsultarSolicitacaoInput = z.infer<
  typeof consultarSolicitacaoSchema
>;
