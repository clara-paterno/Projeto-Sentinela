
import { Platform } from "react-native";

const CHAVE_INDICE = "sentinela_solicitacoes_v1";
const PREFIXO = "sentinela_solicitacao_";
const LIMITE_LOCAL = 15;

export type SolicitacaoSalva = {
  protocolo: string;
  codigoConsulta: string;
  salvaEm: string;
};

// No navegador, os dados ficam somente em memória.
const memoria = new Map<string, string>();

function chaveSolicitacao(protocolo: string) {
  return `${PREFIXO}${protocolo}`;
}

async function ler(chave: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return memoria.get(chave) ?? null;
  }

  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(chave);
}

async function gravar(
  chave: string,
  valor: string
): Promise<void> {
  if (Platform.OS === "web") {
    memoria.set(chave, valor);
    return;
  }

  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(chave, valor);
}

async function apagar(chave: string): Promise<void> {
  if (Platform.OS === "web") {
    memoria.delete(chave);
    return;
  }

  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(chave);
}

async function listarProtocolos(): Promise<string[]> {
  const valor = await ler(CHAVE_INDICE);

  if (!valor) return [];

  const dados: unknown = JSON.parse(valor);

  if (
    !Array.isArray(dados) ||
    !dados.every((item) => typeof item === "string")
  ) {
    throw new Error("Índice de solicitações inválido.");
  }

  return dados;
}

// Salva uma nova solicitação no dispositivo.
export async function salvarSolicitacao(
  protocolo: string,
  codigoConsulta: string
): Promise<void> {
  if (
    !/^[0-9a-f-]{36}$/i.test(protocolo) ||
    !/^[0-9a-f]{48}$/i.test(codigoConsulta)
  ) {
    throw new Error("Credenciais da solicitação inválidas.");
  }

  const protocolos = await listarProtocolos();
  const jaExiste = protocolos.includes(protocolo);

  if (!jaExiste && protocolos.length >= LIMITE_LOCAL) {
    throw new Error(
      "Limite de solicitações salvas atingido."
    );
  }

  const registro: SolicitacaoSalva = {
    protocolo,
    codigoConsulta,
    salvaEm: new Date().toISOString(),
  };

  await gravar(
    chaveSolicitacao(protocolo),
    JSON.stringify(registro)
  );

  if (!jaExiste) {
    await gravar(
      CHAVE_INDICE,
      JSON.stringify([protocolo, ...protocolos])
    );
  }
}

// Retorna as solicitações salvas.
export async function listarSolicitacoesSalvas():
  Promise<SolicitacaoSalva[]> {
  const protocolos = await listarProtocolos();
  const resultado: SolicitacaoSalva[] = [];

  for (const protocolo of protocolos) {
    const valor = await ler(chaveSolicitacao(protocolo));

    if (valor) {
      resultado.push(JSON.parse(valor) as SolicitacaoSalva);
    }
  }

  return resultado;
}

// Exclui apenas os dados locais.
// Não exclui a solicitação do PostgreSQL.
export async function excluirSolicitacaoSalva(
  protocolo: string
): Promise<void> {
  const protocolos = await listarProtocolos();

  await gravar(
    CHAVE_INDICE,
    JSON.stringify(
      protocolos.filter((item) => item !== protocolo)
    )
  );

  await apagar(chaveSolicitacao(protocolo));
}
