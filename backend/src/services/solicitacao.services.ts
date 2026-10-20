import {prisma} from "../lib/prisma.js"
import type { CriarSolicitacaoInput } from "../schemas/solicitacao.schema.js";
import type { ConsultarSolicitacaoInput } from "../schemas/consulta.schema.js";

import { 
  randomBytes, 
  randomUUID, 
  scryptSync,         
  timingSafeEqual
} from "node:crypto";


export async function criarSolicitacaoService(
  dados: CriarSolicitacaoInput
) {
  const categoria = await prisma.categoria.findUnique({
  where: {
    id: dados.categoriaId
  }
});


if (!categoria || !categoria.ativa || categoria.tipo !== dados.tipo) {
  throw new Error("Categoria inválida para esta solicitação");
}

const protocolo = randomUUID();

const codigoConsulta = randomBytes(24).toString("hex");

const codigoConsultaHash = scryptSync(
  codigoConsulta,
  protocolo,
  64
).toString("hex");

const solicitacao = await prisma.solicitacao.create({
  data: {
    protocolo,
    codigoConsultaHash,
    tipo: dados.tipo,
    categoriaId: dados.categoriaId,
    descricao: dados.descricao,
    anonima: dados.anonima,
    latitude: dados.latitude,
    longitude: dados.longitude,
    enderecoOcorrencia: dados.enderecoOcorrencia,

    solicitanteNome: dados.solicitanteNome,
    solicitanteEmail: dados.solicitanteEmail,
    solicitanteTelefone: dados.solicitanteTelefone,
    solicitanteEnderecoResidencial: dados.solicitanteEnderecoResidencial,

    envolvidoNome: dados.envolvidoNome,
    envolvidoEndereco: dados.envolvidoEndereco,
    envolvidoDescricao: dados.envolvidoDescricao
  }
});


  return {
  mensagem: "Solicitação criada",
  protocolo: solicitacao.protocolo,
  codigoConsulta
};

}


export async function consultarSolicitacaoService(
  dados: ConsultarSolicitacaoInput
) {
  const solicitacao = await prisma.solicitacao.findUnique({
    where: {
      protocolo: dados.protocolo
    },
    select: {
      protocolo: true,
      codigoConsultaHash: true,
      tipo: true,
      status: true,
      descricao: true,
      criadaEm: true,
      atualizadaEm: true,
      categoria: {
        select: {
          nome: true
        }
      }
    }
  });

  if (!solicitacao) {
    return null;
  }

  const hashInformado = scryptSync(
    dados.codigoConsulta.toLowerCase(),
    dados.protocolo,
    64
  );

  const hashArmazenado = Buffer.from(
    solicitacao.codigoConsultaHash,
    "hex"
  );

  if (
    hashInformado.length !== hashArmazenado.length ||
    !timingSafeEqual(hashInformado, hashArmazenado)
  ) {
    return null;
  }

  return {
    protocolo: solicitacao.protocolo,
    tipo: solicitacao.tipo,
    categoria: solicitacao.categoria.nome,
    descricao: solicitacao.descricao,
    status: solicitacao.status,
    criadaEm: solicitacao.criadaEm,
    atualizadaEm: solicitacao.atualizadaEm
  };
}

