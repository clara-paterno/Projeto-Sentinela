
import { useState } from "react";

type Pagina = "geral" | "solicitacoes";

type SidebarProps = {
  paginaAtual: Pagina;
  onNavegar: (pagina: Pagina) => void;
  onSair: () => void;
};

export default function Sidebar({
  paginaAtual,
  onNavegar,
  onSair,
}: SidebarProps) {
  const [recolhida, setRecolhida] = useState(false);

  return (
    <aside
      className={`dashboard-sidebar ${
        recolhida ? "sidebar-recolhida" : ""
      }`}
    >
      <div className="sidebar-topo">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setRecolhida(!recolhida)}
          aria-label={
            recolhida ? "Expandir menu" : "Recolher menu"
          }
          title={recolhida ? "Expandir menu" : "Recolher menu"}
        >
          {recolhida ? "☰" : "‹"}
        </button>
      </div>

      <nav className="sidebar-navegacao" aria-label="Navegação principal">
        <button
          type="button"
          className={`sidebar-item ${
            paginaAtual === "geral" ? "sidebar-item-ativo" : ""
          }`}
          onClick={() => onNavegar("geral")}
          title="Geral"
          aria-current={paginaAtual === "geral" ? "page" : undefined}
        >
          <span className="sidebar-icone" aria-hidden="true">▦</span>
          {!recolhida && <span>Geral</span>}
        </button>

        <button
          type="button"
          className={`sidebar-item ${
            paginaAtual === "solicitacoes" ? "sidebar-item-ativo" : ""
          }`}
          onClick={() => onNavegar("solicitacoes")}
          title="Solicitações"
          aria-current={paginaAtual === "solicitacoes" ? "page" : undefined}
        >
          <span className="sidebar-icone" aria-hidden="true">☷</span>
          {!recolhida && <span>Solicitações</span>}
        </button>
      </nav>

      <div className="sidebar-rodape">
        <button
          type="button"
          className="sidebar-item sidebar-sair"
          onClick={onSair}
          title="Sair do sistema"
        >
          <span className="sidebar-icone" aria-hidden="true">↪</span>
          {!recolhida && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
