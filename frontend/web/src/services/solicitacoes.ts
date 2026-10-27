
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export type SolicitacaoGCM = {
  id: string;
  protocolo: string;
  tipo: "DENUNCIA" | "OCORRENCIA";
  descricao: string;
  status:
    | "RECEBIDA"
    | "EM_ANALISE"
    | "EM_ATENDIMENTO"
    | "CONCLUIDA"
    | "ENCERRADA_SEM_ATENDIMENTO";
  criadaEm: string;
  atualizadaEm: string;
  categoria?: {
    id: string;
    nome: string;
  } | string;
};

export async function buscarSolicitacoes(
  token: string
): Promise<SolicitacaoGCM[]> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}/gcm/solicitacoes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor."
    );
  }

  if (resposta.status === 401 || resposta.status === 403) {
    throw new Error(
      "Sua sessão não é válida ou expirou. Faça login novamente."
    );
  }

  if (!resposta.ok) {
    throw new Error(
      "Não foi possível carregar as solicitações."
    );
  }

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error(
      "O servidor retornou um formato de solicitações inesperado."
    );
  }

  return dados as SolicitacaoGCM[];
}
