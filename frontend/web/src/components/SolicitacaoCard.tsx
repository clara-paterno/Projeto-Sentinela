
import type { SolicitacaoGCM } from "../services/solicitacoes";

type SolicitacaoCardProps = {
  solicitacao: SolicitacaoGCM;
  onClick: (id: string) => void;
};

const statusLabels: Record<SolicitacaoGCM["status"], string> = {
  RECEBIDA: "Recebida",
  EM_ANALISE: "Em análise",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDA: "Concluída",
  ENCERRADA_SEM_ATENDIMENTO: "Encerrada sem atendimento",
};

export default function SolicitacaoCard({
  solicitacao,
  onClick,
}: SolicitacaoCardProps) {
  const categoria =
    typeof solicitacao.categoria === "string"
      ? solicitacao.categoria
      : solicitacao.categoria?.nome ?? "Sem categoria";

  const data = new Date(solicitacao.criadaEm).toLocaleDateString(
    "pt-BR"
  );

  const tipo =
    solicitacao.tipo === "DENUNCIA" ? "Denúncia" : "Ocorrência";

  return (
    <button
      type="button"
      className="solicitacao-card"
      onClick={() => onClick(solicitacao.id)}
    >
      <div className="solicitacao-card-topo">
        <span className="solicitacao-card-tipo">{tipo}</span>

        <span
          className={`solicitacao-card-status status-${solicitacao.status.toLowerCase()}`}
        >
          {statusLabels[solicitacao.status] ?? solicitacao.status}
        </span>
      </div>

      <h3 className="solicitacao-card-titulo">{categoria}</h3>

      <p className="solicitacao-card-descricao">
        {solicitacao.descricao}
      </p>

      <div className="solicitacao-card-rodape">
        <span>{data}</span>
        <span className="solicitacao-card-acao">
          Ver detalhes →
        </span>
      </div>
    </button>
  );
}
