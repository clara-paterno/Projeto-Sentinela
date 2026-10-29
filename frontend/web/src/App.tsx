import Geral, { type GrupoSituacao } from "./pages/geral";
import Solicitacoes from "./pages/Solicitacoes";
import Detalhes from "./pages/Detalhes";
import { useState, type FormEvent } from "react";
import { loginAgente } from "./services/auth";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./App.css";

type Pagina = "geral" | "solicitacoes";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const [paginaAtual, setPaginaAtual] = useState<Pagina>("geral");
  const [situacaoSelecionada, setSituacaoSelecionada] =
    useState<GrupoSituacao | null>(null);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<
    string | null
  >(null);

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
      const resposta = await loginAgente({ email, senha });

      setToken(resposta.token);
      setSenha("");
      setPaginaAtual("geral");
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

  function sair() {
    setToken(null);
    setEmail("");
    setSenha("");
    setErro("");
    setMostrarSenha(false);
    setSolicitacaoSelecionada(null);
    setPaginaAtual("geral");
  }

  function filtrarPorSituacao(grupo: GrupoSituacao) {
    setSituacaoSelecionada(grupo);
    setPaginaAtual("solicitacoes");
  }

  function navegar(pagina: Pagina) {
  setSolicitacaoSelecionada(null);
  setSituacaoSelecionada(null);
  setPaginaAtual(pagina);
} 

  function abrirSolicitacao(id: string) {
    setSolicitacaoSelecionada(id);
  }

  function voltarSolicitacao() {
    setSolicitacaoSelecionada(null);
  }

  // Área protegida: só aparece após autenticação.
  if (token) {
    return (
      <div className="dashboard">
        <Header />

        <div className="dashboard-corpo">
          <Sidebar
            paginaAtual={paginaAtual}
            onNavegar={navegar}
            onSair={sair}
          />

          <main className="dashboard-conteudo">
            {solicitacaoSelecionada ? (
              <Detalhes
                token={token}
                id={solicitacaoSelecionada}
                onVoltar={voltarSolicitacao}
              />
            ) : paginaAtual === "geral" ? (
              <Geral
                token={token}
                onAbrirSolicitacao={abrirSolicitacao}
                onFiltrarSituacao={filtrarPorSituacao}
              />
            ) : (
              <Solicitacoes
                token={token}
                situacaoInicial={situacaoSelecionada}
                onAbrirSolicitacao={abrirSolicitacao}
              />
            )}
          </main>
        </div>
      </div>
    );
  }

  // Tela de login
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
