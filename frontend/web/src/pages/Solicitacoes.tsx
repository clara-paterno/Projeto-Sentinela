import { useEffect, useState } from "react";
import SolicitacaoCard from "../components/SolicitacaoCard";
import {
  buscarSolicitacoes,
  type SolicitacaoGCM,
  type StatusSolicitacao,
  type TipoSolicitacao,
} from "../services/solicitacoes";
import { buscarCategorias, type Categoria } from "../services/categorias";
import type { GrupoSituacao } from "./geral";

type SolicitacoesProps = {
  token: string;
  situacaoInicial: GrupoSituacao | null;
  onAbrirSolicitacao: (id: string) => void;
};

type Situacao = GrupoSituacao | "todas";

type Paginacao = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
};

const STATUS_POR_SITUACAO: Record<GrupoSituacao, StatusSolicitacao[]> = {
  aberto: ["RECEBIDA"],
  andamento: ["EM_ANALISE", "EM_ATENDIMENTO"],
  encerrado: ["CONCLUIDA", "ENCERRADA_SEM_ATENDIMENTO"],
};

const LIMITE = 10;

export default function Solicitacoes({
  token,
  situacaoInicial,
  onAbrirSolicitacao,
}: SolicitacoesProps) {
  const [situacao, setSituacao] = useState<Situacao>(
    situacaoInicial ?? "todas",
  );

  const [tipo, setTipo] = useState<TipoSolicitacao | "todos">("todos");
  const [categoriaId, setCategoriaId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pagina, setPagina] = useState(1);

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoGCM[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao>({
    pagina: 1,
    limite: LIMITE,
    total: 0,
    totalPaginas: 0,
  });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroFiltros, setErroFiltros] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [erroCategorias, setErroCategorias] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarCategorias() {
      try {
        const dados = await buscarCategorias();

        if (ativo) {
          setCategorias(dados);
        }
      } catch (erro) {
        if (ativo) {
          setErroCategorias(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar as categorias.",
          );
        }
      } finally {
        if (ativo) {
          setCarregandoCategorias(false);
        }
      }
    }

    void carregarCategorias();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");

      try {
        const resposta = await buscarSolicitacoes(token, {
          status:
            situacao === "todas" ? undefined : STATUS_POR_SITUACAO[situacao],
          tipo: tipo === "todos" ? undefined : tipo,
          categoriaId: categoriaId || undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
          pagina,
          limite: LIMITE,
        });

        if (!ativo) return;

        setSolicitacoes(resposta.solicitacoes);
        setPaginacao(resposta.paginacao);
      } catch (erro) {
        if (!ativo) return;

        setSolicitacoes([]);
        setErro(
          erro instanceof Error
            ? erro.message
            : "Não foi possível carregar as solicitações.",
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [token, situacao, tipo, categoriaId, dataInicio, dataFim, pagina]);

  function mudarSituacao(nova: Situacao) {
    setSituacao(nova);
    setPagina(1);
  }

  function mudarTipo(novo: TipoSolicitacao | "todos") {
    setTipo(novo);
    setCategoriaId("");
    setPagina(1);
  }

  function mudarCategoria(valor: string) {
    setCategoriaId(valor);
    setPagina(1);
  }

  function aplicarDatas(inicio: string, fim: string) {
    if (inicio && fim && inicio > fim) {
      setErroFiltros("A data inicial não pode ser posterior à data final.");
      return;
    }

    setErroFiltros("");
    setDataInicio(inicio);
    setDataFim(fim);
    setPagina(1);
  }

  function limparFiltros() {
    setSituacao("todas");
    setTipo("todos");
    setCategoriaId("");
    setDataInicio("");
    setDataFim("");
    setErroFiltros("");
    setPagina(1);
  }

  return (
    <section className="pagina-solicitacoes">
      <div className="pagina-cabecalho">
        <h1>Solicitações</h1>
        <p>Consulte e gerencie denúncias e ocorrências registradas.</p>
      </div>

      <div className="filtros-solicitacoes">
        <div>
          <label htmlFor="filtro-situacao">Situação</label>
          <select
            id="filtro-situacao"
            value={situacao}
            onChange={(e) => mudarSituacao(e.target.value as Situacao)}
          >
            <option value="todas">Todas as situações</option>
            <option value="aberto">Em aberto</option>
            <option value="andamento">Em andamento</option>
            <option value="encerrado">Encerrados</option>
          </select>
        </div>

        <div>
          <label htmlFor="filtro-tipo">Tipo</label>
          <select
            id="filtro-tipo"
            value={tipo}
            onChange={(e) =>
              mudarTipo(e.target.value as TipoSolicitacao | "todos")
            }
          >
            <option value="todos">Todos os tipos</option>
            <option value="DENUNCIA">Denúncias</option>
            <option value="OCORRENCIA">Ocorrências</option>
          </select>
        </div>

        <div>
          <label htmlFor="filtro-categoria">Categoria</label>

          <select
            id="filtro-categoria"
            value={categoriaId}
            onChange={(e) => mudarCategoria(e.target.value)}
            disabled={carregandoCategorias || !!erroCategorias}
          >
            <option value="">
              {carregandoCategorias
                ? "Carregando categorias..."
                : "Todas as categorias"}
            </option>

            {categorias
              .filter(
                (categoria) => tipo === "todos" || categoria.tipo === tipo,
              )
              .map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
          </select>

          {erroCategorias && <small role="alert">{erroCategorias}</small>}
        </div>

        <div>
          <label htmlFor="data-inicio">Data inicial</label>
          <input
            id="data-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => aplicarDatas(e.target.value, dataFim)}
          />
        </div>

        <div>
          <label htmlFor="data-fim">Data final</label>
          <input
            id="data-fim"
            type="date"
            value={dataFim}
            onChange={(e) => aplicarDatas(dataInicio, e.target.value)}
          />
        </div>

        <button type="button" onClick={limparFiltros}>
          Limpar filtros
        </button>
      </div>

      {erroFiltros && <p role="alert">{erroFiltros}</p>}

      {carregando ? (
        <p role="status">Carregando solicitações...</p>
      ) : erro ? (
        <p role="alert">{erro}</p>
      ) : (
        <>
          <p className="solicitacoes-total">
            {paginacao.total} solicitação(ões) encontrada(s)
          </p>

          {solicitacoes.length === 0 ? (
            <p>Nenhuma solicitação encontrada para estes filtros.</p>
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

          <div className="solicitacoes-paginacao">
            <button
              type="button"
              disabled={pagina <= 1}
              onClick={() => setPagina((atual) => atual - 1)}
            >
              Anterior
            </button>

            <span>
              Página {paginacao.pagina} de {Math.max(1, paginacao.totalPaginas)}
            </span>

            <button
              type="button"
              disabled={pagina >= paginacao.totalPaginas}
              onClick={() => setPagina((atual) => atual + 1)}
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </section>
  );
}
