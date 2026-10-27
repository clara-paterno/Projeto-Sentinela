import { useState, type FormEvent } from "react";
import { loginAgente } from "./services/auth";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [token, setToken] = useState<string | null>(null);

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (carregando) return;

    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Preencha o e-mail e a senha.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await loginAgente({
        email,
        senha,
      });

      // Por enquanto, o token fica apenas na memória do React.
      // Não armazenamos credenciais no navegador.
      setToken(resposta.token);
      setSenha("");
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível realizar o login.",
      );
    } finally {
      setCarregando(false);
    }
  }

  // Tela temporária para confirmar a autenticação.
  // Depois será substituída pelo dashboard da GCM.
  if (token) {
    return (
      <main className="login-page">
        <section
          className="login-area"
          style={{
            gridColumn: "1 / -1",
            minHeight: "100vh",
            textAlign: "center",
          }}
        >
          <div className="login-card">
            <span className="login-etiqueta">ACESSO AUTORIZADO</span>

            <h1
              style={{
                marginTop: 20,
                marginBottom: 16,
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 1.3,
                letterSpacing: "-0.5px",
              }}
            >
              Bem-vindo ao Sentinela GCM!
            </h1>
            <p style={{ color: "#9AA4B2", marginTop: 16 }}>
              Autenticação realizada com sucesso.
            </p>

            <button
              className="botao-login"
              type="button"
              onClick={() => {
                setToken(null);
                setEmail("");
              }}
            >
              Sair
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-institucional">
        <div className="marca">
          <div className="marca-icone">✦</div>
          <span>SENTINELA</span>
        </div>

        <div className="institucional-conteudo">
          <span className="institucional-etiqueta">PLATAFORMA DE GESTÃO</span>

          <h1>Tecnologia a serviço da segurança.</h1>

          <p>
            Uma plataforma para acompanhar, organizar e atender às solicitações
            da comunidade com eficiência e transparência.
          </p>
        </div>

        <div className="institucional-rodape">
          Guarda Civil Municipal
          <span>Piquet Carneiro • Ceará</span>
        </div>
      </section>

      <section className="login-area">
        <div className="login-card">
          <div className="login-cabecalho">
            <span className="login-etiqueta">ACESSO RESTRITO</span>

            <h2>Bem-vindo de volta</h2>

            <p>Entre com suas credenciais para acessar o painel GCM.</p>
          </div>

          <form onSubmit={entrar}>
            <div className="campo">
              <label htmlFor="email">E-mail institucional</label>

              <input
                id="email"
                type="email"
                placeholder="agente@exemplo.com"
                autoComplete="username"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                disabled={carregando}
              />
            </div>

            <div className="campo">
              <label htmlFor="senha">Senha</label>

              <div className="campo-senha">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(evento) => setSenha(evento.target.value)}
                  disabled={carregando}
                />

                <button
                  type="button"
                  className="mostrar-senha"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  disabled={carregando}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {erro && (
              <p className="mensagem-erro" role="alert">
                {erro}
              </p>
            )}

            <button className="botao-login" type="submit" disabled={carregando}>
              {carregando ? "Autenticando..." : "Entrar no sistema"}

              {!carregando && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <div className="login-rodape">
            <span>Área exclusiva para agentes autorizados.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
