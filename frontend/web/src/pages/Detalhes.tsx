import { useEffect, useState } from "react";
import "../App.css";
import AnexoImagem from "../components/AnexoImagem";
import {
  buscarSolicitacaoPorId,
  atualizarStatusSolicitacao,
  type SolicitacaoDetalhada,
  type StatusSolicitacao,
} from "../services/solicitacoes";

type DetalhesProps = {
  token: string;
  id: string;
  onVoltar: () => void;
};

const statusLabels: Record<StatusSolicitacao, string> = {
  RECEBIDA: "Recebida",
  EM_ANALISE: "Em análise",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDA: "Concluída",
  ENCERRADA_SEM_ATENDIMENTO: "Encerrada sem atendimento",
};

const proximosStatus: Record<StatusSolicitacao, StatusSolicitacao[]> = {
  RECEBIDA: ["EM_ANALISE", "ENCERRADA_SEM_ATENDIMENTO"],
  EM_ANALISE: ["EM_ATENDIMENTO", "ENCERRADA_SEM_ATENDIMENTO"],
  EM_ATENDIMENTO: ["CONCLUIDA", "ENCERRADA_SEM_ATENDIMENTO"],
  CONCLUIDA: [],
  ENCERRADA_SEM_ATENDIMENTO: [],
};

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

export default function Detalhes({ token, id, onVoltar }: DetalhesProps) {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoDetalhada | null>(
    null,
  );

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [novoStatus, setNovoStatus] = useState<StatusSolicitacao | "">("");

  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroAtualizacao, setErroAtualizacao] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await buscarSolicitacaoPorId(token, id);

        if (ativo) setSolicitacao(dados);
      } catch (erro) {
        if (ativo) {
          setErro(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar a solicitação.",
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [token, id]);

  async function salvarAtualizacao() {
    if (!solicitacao || !novoStatus || salvando) return;

    if (novoStatus === "ENCERRADA_SEM_ATENDIMENTO" && !observacao.trim()) {
      setSucesso("");
      setErroAtualizacao(
        "Informe uma justificativa para encerrar sem atendimento",
      );
      return;
    }

    setSalvando(true);
    setErroAtualizacao("");
    setSucesso("");

    try {
      await atualizarStatusSolicitacao(token, id, {
        status: novoStatus,
        ...(observacao.trim() ? { observacao: observacao.trim() } : {}),
      });

      const dadosAtualizados = await buscarSolicitacaoPorId(token, id);

      setSolicitacao(dadosAtualizados);
      setNovoStatus("");
      setObservacao("");
      setSucesso("Status atualizado com sucesso!");
    } catch (erro) {
      setErroAtualizacao(
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <p role="status">Carregando solicitação...</p>;
  }

  if (erro || !solicitacao) {
    return (
      <section>
        <button type="button" onClick={onVoltar}>
          ← Voltar
        </button>
        <p role="alert">{erro || "Solicitação não encontrada."}</p>
      </section>
    );
  }

  const opcoesStatus = proximosStatus[solicitacao.status];
  const atendimentoEncerrado = opcoesStatus.length === 0;

  return (
    <section className="pagina-detalhes">
      <button type="button" className="detalhes-voltar" onClick={onVoltar}>
        ← Voltar
      </button>

      <h1>Detalhes da solicitação</h1>

      <div className="detalhes-card">
        <h2>{solicitacao.categoria.nome}</h2>

        <p>
          <strong>Protocolo:</strong> {solicitacao.protocolo}
        </p>

        <p>
          <strong>Tipo:</strong>{" "}
          {solicitacao.tipo === "DENUNCIA" ? "Denúncia" : "Ocorrência"}
        </p>

        <p>
          <strong>Status atual:</strong> {statusLabels[solicitacao.status]}
        </p>

        <p>
          <strong>Registrada em:</strong> {formatarData(solicitacao.criadaEm)}
        </p>

        <p>
          <strong>Endereço da ocorrência:</strong>{" "}
          {solicitacao.enderecoOcorrencia || "Não informado"}
        </p>

        {solicitacao.latitude !== null && solicitacao.longitude !== null && (
          <p>
            <strong>Coordenadas:</strong> {solicitacao.latitude},{" "}
            {solicitacao.longitude}
          </p>
        )}

        <h3>Descrição</h3>
        <p>{solicitacao.descricao}</p>
      </div>

      <div className="detalhes-card">
        <h2>Anexos da solicitação</h2>

        {solicitacao.anexos.length === 0 ? (
          <p>Nenhuma imagem anexada a esta solicitação.</p>
        ) : (
          <div className="detalhes-anexos">
            {solicitacao.anexos.map((anexo) => (
              <AnexoImagem
                key={anexo.id}
                id={anexo.id}
                nome={anexo.nomeOriginal}
                token={token}
              />
            ))}
          </div>
        )}
      </div>

      {!solicitacao.anonima && (
        <div className="detalhes-card">
          <h2>Dados do solicitante</h2>

          <p>
            <strong>Nome:</strong>{" "}
            {solicitacao.solicitanteNome || "Não informado"}
          </p>

          <p>
            <strong>E-mail:</strong>{" "}
            {solicitacao.solicitanteEmail || "Não informado"}
          </p>

          <p>
            <strong>Telefone:</strong>{" "}
            {solicitacao.solicitanteTelefone || "Não informado"}
          </p>

          <p>
            <strong>Endereço residencial:</strong>{" "}
            {solicitacao.solicitanteEnderecoResidencial || "Não informado"}
          </p>
        </div>
      )}

      {(solicitacao.envolvidoNome ||
        solicitacao.envolvidoEndereco ||
        solicitacao.envolvidoDescricao) && (
        <div className="detalhes-card">
          <h2>Pessoa envolvida</h2>

          <p>
            <strong>Nome:</strong>{" "}
            {solicitacao.envolvidoNome || "Não informado"}
          </p>

          <p>
            <strong>Endereço:</strong>{" "}
            {solicitacao.envolvidoEndereco || "Não informado"}
          </p>

          <p>
            <strong>Descrição:</strong>{" "}
            {solicitacao.envolvidoDescricao || "Não informado"}
          </p>
        </div>
      )}

      <div className="detalhes-card">
        <h2>Atualizar atendimento</h2>

        {atendimentoEncerrado ? (
          <p>
            Esta solicitação foi encerrada e não permite novas alterações de
            status.
          </p>
        ) : (
          <>
            <label htmlFor="novo-status">Novo status</label>

            <select
              id="novo-status"
              value={novoStatus}
              disabled={salvando}
              onChange={(evento) =>
                setNovoStatus(evento.target.value as StatusSolicitacao | "")
              }
            >
              <option value="">Selecione o próximo status</option>

              {opcoesStatus.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>

            <label htmlFor="observacao-atendimento">
              {novoStatus === "ENCERRADA_SEM_ATENDIMENTO"
                ? "Justificativa do encerramento (obrigatória)"
                : "Observação do agente (opcional)"}
            </label>

            <textarea
              id="observacao-atendimento"
              rows={4}
              value={observacao}
              disabled={salvando}
              onChange={(evento) => setObservacao(evento.target.value)}
              placeholder="Descreva as providências tomadas..."
            />

            <button
              type="button"
              onClick={salvarAtualizacao}
              disabled={
                !novoStatus ||
                salvando ||
                (novoStatus === "ENCERRADA_SEM_ATENDIMENTO" &&
                  !observacao.trim())
              }
            >
              {salvando ? "Salvando..." : "Salvar atualização"}
            </button>
          </>
        )}

        {erroAtualizacao && <p role="alert">{erroAtualizacao}</p>}

        {sucesso && <p role="status">{sucesso}</p>}
      </div>

      <div className="detalhes-card">
        <h2>Histórico de atendimento</h2>

        {solicitacao.historicoStatus.length === 0 ? (
          <p>Nenhuma atualização registrada.</p>
        ) : (
          solicitacao.historicoStatus.map((item, index) => (
            <div key={`${item.criadoEm}-${index}`}>
              <p>
                <strong>{statusLabels[item.statusNovo]}</strong>
                {" — "}
                {formatarData(item.criadoEm)}
              </p>

              <p>Agente: {item.agente?.nome ?? "Não informado"}</p>

              {item.observacao && (
                <p>
                  <strong>Observação:</strong> {item.observacao}
                </p>
              )}

              <hr />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
