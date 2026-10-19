import {z} from "zod";

export const criarSolicitacaoSchema = z.object({
  //classificação
  tipo: z.enum(["DENUNCIA", "OCORRENCIA"]),
  descricao: z.string().trim().min(1),
  categoriaId: z.uuid(),
  anonima: z.boolean(),

  //localizaçao
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  enderecoOcorrencia: z.string().trim().min(1).optional(),

  //dados solicitante
  solicitanteEmail: z.email().optional(),
  solicitanteTelefone: z.string().min(10).optional(),
  solicitanteNome: z.string().trim().min(1).optional(),
  solicitanteEnderecoResidencial: z.string().trim().min(1).optional(),

  //dados pessoa envolvida
  envolvidoNome: z.string().trim().min(1).optional(),
  envolvidoEndereco: z.string().trim().min(1).optional(),
  envolvidoDescricao: z.string().trim().min(1).optional(),

}) .superRefine((dados, ctx) => {
  const temEndereco = !!dados.enderecoOcorrencia;

  const temCoordenadas =
    dados.latitude !== undefined &&
    dados.longitude !== undefined;

  if (!temEndereco && !temCoordenadas) {
    ctx.addIssue({
      code: "custom",
      message: "Informe um endereço ou latitude e longitude"
    });
  }

  if (dados.anonima && dados.tipo !== "DENUNCIA") {
    ctx.addIssue({
      code: "custom",
      message: "Apenas denúncias podem ser anônimas"
    });
  }

  if (dados.anonima) {
    if (
      dados.solicitanteNome !== undefined ||
      dados.solicitanteEmail !== undefined ||
      dados.solicitanteTelefone !== undefined ||
      dados.solicitanteEnderecoResidencial !== undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Denúncias anônimas não devem conter dados pessoais do solicitante"
      });
    }
  } else {
    if (
      !dados.solicitanteNome ||
      !dados.solicitanteEnderecoResidencial ||
      (!dados.solicitanteEmail && !dados.solicitanteTelefone)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Informe nome, endereço residencial e pelo menos um contato"
      });
    }
  }
});

export type CriarSolicitacaoInput =
  z.infer<typeof criarSolicitacaoSchema>;