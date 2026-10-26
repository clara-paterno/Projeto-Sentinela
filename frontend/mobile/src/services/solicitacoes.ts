import { Platform } from "react-native";
import type { ImagePickerAsset } from "expo-image-picker";

export type TipoSolicitacao = "DENUNCIA" | "OCORRENCIA";

export type Categoria = {
  id: string;
  nome: string;
  tipo: TipoSolicitacao;
  ativa?: boolean;
};

export type CriarSolicitacaoInput = {
  tipo: TipoSolicitacao;
  descricao: string;
  categoriaId: string;
  anonima: boolean;
  enderecoOcorrencia: string;
  solicitanteNome?: string;
  solicitanteEmail?: string;
  solicitanteTelefone?: string;
  solicitanteEnderecoResidencial?: string;
  envolvidoNome?: string;
  envolvidoEndereco?: string;
  envolvidoDescricao?: string;
};

export type SolicitacaoCriada = {
  mensagem: string;
  protocolo: string;
  codigoConsulta: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function request<T>(
  caminho: string,
  options?: RequestInit
): Promise<T> {
  if (!API_URL) {
    throw new Error("Configure EXPO_PUBLIC_API_URL no .env");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${caminho}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique a rede."
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "Erro ao comunicar com o servidor";

    throw new Error(mensagem);
  }

  return data as T;
}

export function buscarCategorias() {
  return request<Categoria[]>("/categorias");
}

export function criarSolicitacao(dados: CriarSolicitacaoInput) {
  return request<SolicitacaoCriada>("/solicitacoes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export type ConsultaSolicitacaoInput = {
  protocolo: string;
  codigoConsulta: string;
};

export type SolicitacaoConsultada = {
  protocolo: string;
  tipo: TipoSolicitacao;
  categoria: string;
  descricao: string;
  status:
    | "RECEBIDA"
    | "EM_ANALISE"
    | "EM_ATENDIMENTO"
    | "CONCLUIDA"
    | "ENCERRADA_SEM_ATENDIMENTO";
  criadaEm: string;
  atualizadaEm: string;
};

export function consultarSolicitacao(
  dados: ConsultaSolicitacaoInput
) {
  return request<SolicitacaoConsultada>(
    "/solicitacoes/consulta",
    {
      method: "POST",
      body: JSON.stringify(dados),
    }
  );
}

export async function enviarAnexos(
  protocolo: string,
  codigoConsulta: string,
  imagens: ImagePickerAsset[]
): Promise<void> {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  if (!API_URL) {
    throw new Error("URL da API não configurada.");
  }

  if (imagens.length === 0 || imagens.length > 3) {
    throw new Error("Selecione entre 1 e 3 imagens.");
  }

  const formData = new FormData();

  formData.append("protocolo", protocolo);
  formData.append("codigoConsulta", codigoConsulta);

  for (let i = 0; i < imagens.length; i++) {
    const imagem = imagens[i];

    const tipo = imagem.mimeType;
    if (!tipo || !["image/jpeg", "image/png", "image/webp"].includes(tipo)) {
      throw new Error("Formato de imagem não permitido.");
    }

    if (imagem.fileSize !== undefined &&
        imagem.fileSize > 5 * 1024 * 1024) {
      throw new Error("Uma imagem ultrapassa o limite de 5 MB.");
    }

    const nome = imagem.fileName ||
      `imagem-${i + 1}.${tipo === "image/png"
        ? "png"
        : tipo === "image/webp"
          ? "webp"
          : "jpg"}`;

    if (Platform.OS === "web") {
      if (!imagem.file) {
        throw new Error("Arquivo não disponível para upload.");
      }

      formData.append("imagens", imagem.file, nome);
    } else {
      formData.append("imagens", {
        uri: imagem.uri,
        name: nome,
        type: tipo,
      } as unknown as Blob);
    }
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}/solicitacoes/anexos`,
      {
        method: "POST",
        body: formData,
      }
    );
  } catch {
    throw new Error("Falha de conexão durante o upload.");
  }

  if (!response.ok) {
    const dados = await response.json().catch(() => null);

    throw new Error(
      dados?.mensagem ??
      `Falha no upload (HTTP ${response.status}).`
    );
  }
}

