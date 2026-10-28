
import { useEffect, useState } from "react";
import SolicitacaoCard from "../components/SolicitacaoCard";

import {
  buscarSolicitacoes,
  type SolicitacaoGCM,
  type StatusSolicitacao,
} from "../services/solicitacoes";

export type GrupoSituacao = "aberto" | "andamento" | "encerrado";

const STATUS_POR_GRUPO: Record<
  GrupoSituacao,
  StatusSolicitacao[]
> = {
  aberto: ["RECEBIDA"],
  andamento: ["EM_ANALISE", "EM_ATENDIMENTO"],
  encerrado: ["CONCLUIDA", "ENCERRADA_SEM_ATENDIMENTO"],
};

type GeralProps = {
  token: string;
  onAbrirSolicitacao: (id: string) => void;
  onFiltrarSituacao: (grupo: GrupoSituacao) => void;
};

type Indicadores = {
  aberto: number;
  andamento: number;
  encerrado: number;
};

const indicadoresConfig: {
  grupo: GrupoSituacao;
  titulo: string;
  descricao: string;
}[] = [
  {
    grupo: "aberto",
    titulo: "Em aberto",
    descricao: "Aguardando análise",
  },
  {
    grupo: "andamento",
    titulo: "Em andamento",
    descricao: "Em análise ou atendimento",
  },
  {
    grupo: "encerrado",
    titulo: "Encerrados",
    descricao: "Atendimentos finalizados",
  },
];

export default function Geral({
  token,
  onAbrirSolicitacao,
  onFiltrarSituacao,
}: GeralProps) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoGCM[]>([]);
  const [indicadores, setIndicadores] = useState<Indicadores>({
    aberto: 0,
    andamento: 0,
    encerrado: 0,
  });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");

      try {
        const [recentes, abertas, andamento, encerradas] =
          await Promise.all([
            buscarSolicitacoes(token, {
              pagina: 1,
              limite: 6,
            }),

            buscarSolicitacoes(token, {
              status: STATUS_POR_GRUPO.aberto,
              pagina: 1,
              limite: 1,
            }),

            buscarSolicitacoes(token, {
              status: STATUS_POR_GRUPO.andamento,
              pagina: 1,
              limite: 1,
            }),

            buscarSolicitacoes(token, {
              status: STATUS_POR_GRUPO.encerrado,
              pagina: 1,
              limite: 1,
            }),
          ]);

        if (!ativo) return;

        setSolicitacoes(recentes.solicitacoes);

        setIndicadores({
          aberto: abertas.paginacao.total,
          andamento: andamento.paginacao.total,
          encerrado: encerradas.paginacao.total,
        });
      } catch (erro) {
        if (!ativo) return;

        setErro(
          erro instanceof Error
            ? erro.message
            : "Não foi possível carregar o dashboard."
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarDados();

    return () => {
      ativo = false;
    };
  }, [token]);

  return (
    <section className="pagina-geral">
      <div className="pagina-cabecalho">
        <h1>Visão geral</h1>
        <p>Acompanhe as solicitações recentes da comunidade.</p>
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
            {indicadoresConfig.map((indicador) => (
              <button
                key={indicador.grupo}
                type="button"
                className={`indicador-card indicador-${indicador.grupo}`}
                onClick={() => onFiltrarSituacao(indicador.grupo)}
                title={`Ver solicitações: ${indicador.titulo}`}
              >
                <div className="indicador-topo">
                  <span>{indicador.titulo}</span>
                  <span aria-hidden="true">↗</span>
                </div>

                <strong>{indicadores[indicador.grupo]}</strong>

                <small>{indicador.descricao}</small>
              </button>
            ))}
          </div>

          <div className="geral-secao">
            <h2>Solicitações recentes</h2>

            {solicitacoes.length === 0 ? (
              <p>Nenhuma solicitação cadastrada.</p>
            ) : (
              <div className="geral-cards">
                {solicitacoes.map((solicitacao) => (
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
