
import { prisma } from "../lib/prisma.js";
import type { AtualizarStatusInput } from "../schemas/status.schema.js";
import type { StatusSolicitacao } from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";


export type FiltrosGcm = {
  categoriaId?: string;
  tipo?: "DENUNCIA" | "OCORRENCIA";
  status?: StatusSolicitacao[];
  dataInicio?: Date;
  dataFim?: Date;
  pagina?: number;
  limite?: number;
};

export async function listarSolicitacoesGcmService(
  filtros: FiltrosGcm = {}
) {
  const pagina = filtros.pagina ?? 1;
  const limite = filtros.limite ?? 10;

  const where: Prisma.SolicitacaoWhereInput = {};

  if (filtros.categoriaId) {
    where.categoriaId = filtros.categoriaId;
  }

  if (filtros.tipo) {
    where.tipo = filtros.tipo;
  }

  if (filtros.status && filtros.status.length > 0) {
  where.status = {
    in: filtros.status,
  };
}

  if (filtros.dataInicio || filtros.dataFim) {
    where.criadaEm = {
      gte: filtros.dataInicio,
      lte: filtros.dataFim,
    };
  }

  const [solicitacoes, total] = await prisma.$transaction([
    prisma.solicitacao.findMany({
      where,
      select: {
        id: true,
        protocolo: true,
        tipo: true,
        status: true,
        anonima: true,
        descricao: true,
        criadaEm: true,
        categoria: {
          select: {
            nome: true,
          },
        },
      },
      orderBy: [
        { criadaEm: "desc" },
        { id: "desc" },
      ],
      skip: (pagina - 1) * limite,
      take: limite,
    }),

    prisma.solicitacao.count({
      where,
    }),
  ]);

  return {
    solicitacoes,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    },
  };
}

export async function detalharSolicitacaoGcmService(
  id: string
) {
  return prisma.solicitacao.findUnique({
    where: { id },
    select: {
      id: true,
      protocolo: true,
      tipo: true,
      status: true,
      anonima: true,
      descricao: true,
      latitude: true,
      longitude: true,
      enderecoOcorrencia: true,
      solicitanteNome: true,
      solicitanteEmail: true,
      solicitanteTelefone: true,
      solicitanteEnderecoResidencial: true,
      envolvidoNome: true,
      envolvidoEndereco: true,
      envolvidoDescricao: true,
      criadaEm: true,
      atualizadaEm: true,
      categoria: {
        select: {
          id: true,
          nome: true,
          tipo: true
        }
      },
      anexos: {
        select: {
          id: true,
          nomeOriginal: true,
          url: true,
          mineType: true,
          tamanhoBytes: true
        }
      },
      historicoStatus: {
        select: {
          statusAnterior: true,
          statusNovo: true,
          observacao: true,
          criadoEm: true,
          agente: {
            select: {
              nome: true
            }
          }
        },
        orderBy: {
          criadoEm: "asc"
        }
      }
    }
  });
}


const transicoesPermitidas: Record<
  StatusSolicitacao,
  StatusSolicitacao[]
> = {
  RECEBIDA: [
    "EM_ANALISE",
    "ENCERRADA_SEM_ATENDIMENTO"
  ],
  EM_ANALISE: [
    "EM_ATENDIMENTO",
    "ENCERRADA_SEM_ATENDIMENTO"
  ],
  EM_ATENDIMENTO: [
    "CONCLUIDA",
    "ENCERRADA_SEM_ATENDIMENTO"
  ],
  CONCLUIDA: [],
  ENCERRADA_SEM_ATENDIMENTO: []
};

export async function atualizarStatusGcmService(
  id: string,
  agenteId: string,
  dados: AtualizarStatusInput
) {
  return prisma.$transaction(async (tx) => {
    // Serializa alterações concorrentes na mesma solicitação.
    const bloqueadas = await tx.$queryRaw<
      Array<{ id: string }>
    >`
      SELECT id FROM "Solicitacao"
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;

    if (bloqueadas.length === 0) {
      return { erro: "NAO_ENCONTRADA" as const };
    }

    const solicitacao = await tx.solicitacao.findUniqueOrThrow({
      where: { id },
      select: { status: true }
    });

    const permitidas = transicoesPermitidas[solicitacao.status];

    if (!permitidas.includes(dados.status)) {
      return { erro: "TRANSICAO_INVALIDA" as const };
    }

    const atualizada = await tx.solicitacao.update({
      where: { id },
      data: { status: dados.status },
      select: {
        id: true,
        protocolo: true,
        status: true,
        atualizadaEm: true
      }
    });

    await tx.historicoStatus.create({
      data: {
        solicitacaoId: id,
        agenteId,
        statusAnterior: solicitacao.status,
        statusNovo: dados.status,
        observacao: dados.observacao || null
      }
    });

    return { solicitacao: atualizada };
  });
}
