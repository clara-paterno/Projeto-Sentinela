
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export type StatusSolicitacao =
  | "RECEBIDA"
  | "EM_ANALISE"
  | "EM_ATENDIMENTO"
  | "CONCLUIDA"
  | "ENCERRADA_SEM_ATENDIMENTO";

export type TipoSolicitacao = "DENUNCIA" | "OCORRENCIA";

export type SolicitacaoGCM = {
  id: string;
  protocolo: string;
  tipo: TipoSolicitacao;
  descricao: string;
  status: StatusSolicitacao;
  anonima: boolean;
  criadaEm: string;
  categoria: {
    nome: string;
  };
};


export type SolicitacaoDetalhada = SolicitacaoGCM & {
  latitude: number | null;
  longitude: number | null;
  enderecoOcorrencia: string | null;

  solicitanteNome: string | null;
  solicitanteEmail: string | null;
  solicitanteTelefone: string | null;
  solicitanteEnderecoResidencial: string | null;

  envolvidoNome: string | null;
  envolvidoEndereco: string | null;
  envolvidoDescricao: string | null;

  atualizadaEm: string;

  categoria: {
    id: string;
    nome: string;
    tipo: TipoSolicitacao;
  };

  anexos: {
    id: string;
    nomeOriginal: string;
    url: string;
    mineType: string;
    tamanhoBytes: number;
  }[];

  historicoStatus: {
    statusAnterior: StatusSolicitacao;
    statusNovo: StatusSolicitacao;
    observacao: string | null;
    criadoEm: string;
    agente: {
      nome: string;
    };
  }[];
};

export type FiltrosSolicitacoes = {
  categoriaId?: string;
  tipo?: TipoSolicitacao;
  status?: StatusSolicitacao | StatusSolicitacao[];
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  limite?: number;
};

export type RespostaSolicitacoes = {
  solicitacoes: SolicitacaoGCM[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
};

export async function buscarSolicitacoes(
  token: string,
  filtros: FiltrosSolicitacoes = {}
): Promise<RespostaSolicitacoes> {
  const parametros = new URLSearchParams();

  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== "") {
      parametros.set(chave, String(valor));
    }
  }

  const query = parametros.toString();
  const url = `${API_URL}/gcm/solicitacoes${query ? `?${query}` : ""}`;

  let resposta: Response;

  try {
    resposta = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  if (resposta.status === 401 || resposta.status === 403) {
    throw new Error(
      "Sua sessão expirou ou não é válida. Faça login novamente."
    );
  }

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar as solicitações.");
  }

  const dados: unknown = await resposta.json();

  if (
    typeof dados !== "object" ||
    dados === null ||
    !("solicitacoes" in dados) ||
    !Array.isArray(dados.solicitacoes) ||
    !("paginacao" in dados) ||
    typeof dados.paginacao !== "object" ||
    dados.paginacao === null
  ) {
    throw new Error("O servidor retornou um formato inesperado.");
  }

  return dados as RespostaSolicitacoes;
}


export async function buscarSolicitacaoPorId(
  token: string,
  id: string
): Promise<SolicitacaoDetalhada> {
  let resposta: Response;

  try {
    resposta = await fetch(
      `${API_URL}/gcm/solicitacoes/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor."
    );
  }

  if (resposta.status === 401 || resposta.status === 403) {
    throw new Error(
      "Sua sessão expirou ou não é válida. Faça login novamente."
    );
  }

  if (resposta.status === 404) {
    throw new Error("Solicitação não encontrada.");
  }

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível carregar os detalhes da solicitação."
    );
  }

  const dados: unknown = await resposta.json();

  if (
    typeof dados !== "object" ||
    dados === null ||
    !("id" in dados) ||
    typeof dados.id !== "string" ||
    !("historicoStatus" in dados) ||
    !Array.isArray(dados.historicoStatus) ||
    !("anexos" in dados) ||
    !Array.isArray(dados.anexos)
  ) {
    throw new Error(
      "O servidor retornou detalhes em formato inesperado."
    );
  }

  return dados as SolicitacaoDetalhada;
}
