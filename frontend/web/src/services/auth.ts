
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export type LoginInput = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  token: string;
};

export async function loginAgente(
  credenciais: LoginInput
): Promise<LoginResponse> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credenciais.email.trim(),
        senha: credenciais.senha,
      }),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique sua conexão."
    );
  }

  const dados: unknown = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401 || resposta.status === 403) {
      throw new Error("E-mail ou senha incorretos.");
    }

    throw new Error("Não foi possível realizar o login. Tente novamente.");
  }

  if (
    typeof dados !== "object" ||
    dados === null ||
    !("token" in dados) ||
    typeof dados.token !== "string" ||
    !dados.token
  ) {
    throw new Error("O servidor retornou uma resposta de login inválida.");
  }

  return { token: dados.token };
}
