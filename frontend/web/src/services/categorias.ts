
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export type Categoria = {
  id: string;
  nome: string;
  tipo: "DENUNCIA" | "OCORRENCIA";
  ativa: boolean;
};

export async function buscarCategorias(): Promise<Categoria[]> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}/categorias`, {
      method: "GET",
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor para buscar as categorias."
    );
  }

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar as categorias.");
  }

  const dados: unknown = await resposta.json();

  if (!Array.isArray(dados)) {
    throw new Error(
      "O servidor retornou um formato de categorias inesperado."
    );
  }

  return dados as Categoria[];
}
