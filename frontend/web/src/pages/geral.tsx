
import { useEffect, useState } from "react";
import SolicitacaoCard from "../components/SolicitacaoCard";
import {
  buscarSolicitacoes,
  type SolicitacaoGCM,
} from "../services/solicitacoes";

type GeralProps = {
  token: string;
  onAbrirSolicitacao: (id: string) => void;
};

export default function Geral({
  token,
  onAbrirSolicitacao,
}: GeralProps) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoGCM[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarSolicitacoes() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await buscarSolicitacoes(token);

        if (ativo) {
          setSolicitacoes(dados);
        }
      } catch (erro) {
        if (ativo) {
          setErro(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar as solicitações."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarSolicitacoes();

    return () => {
      ativo = false;
    };
  }, [token]);

  const recentes = [...solicitacoes]
    .sort(
      (a, b) =>
        new Date(b.criadaEm).getTime() -
        new Date(a.criadaEm).getTime()
    )
    .slice(0, 6);

  const aguardandoAnalise = solicitacoes.filter(
    (solicitacao) => solicitacao.status === "RECEBIDA"
  ).length;

  const emAtendimento = solicitacoes.filter(
    (solicitacao) => solicitacao.status === "EM_ATENDIMENTO"
  ).length;

  return (
    <section className="pagina-geral">
      <div className="pagina-cabecalho">
        <h1>Visão geral</h1>
        <p>
          Acompanhe as solicitações recentes da comunidade.
        </p>
      </div>

      {carregando ? (
        <p role="status">Carregando solicitações...</p>
      ) : erro ? (
        <div role="alert">
          <p>{erro}</p>
        </div>
      ) : (
        <>
          <div className="geral-indicadores">
            <div className="indicador-card">
              <span>Aguardando análise</span>
              <strong>{aguardandoAnalise}</strong>
            </div>

            <div className="indicador-card">
              <span>Em atendimento</span>
              <strong>{emAtendimento}</strong>
            </div>
          </div>

          <div className="geral-secao">
            <h2>Solicitações recentes</h2>

            {recentes.length === 0 ? (
              <p>Nenhuma solicitação cadastrada.</p>
            ) : (
              <div className="geral-cards">
                {recentes.map((solicitacao) => (
                  <SolicitacaoCard
                    key={solicitacao.id}
                    solicitacao={solicitacao}
                    onClick={onAbrirSolicitacao}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
