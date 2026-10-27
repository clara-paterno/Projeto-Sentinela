
type HeaderProps = {
  nomeAgente?: string;
};

export default function Header({
  nomeAgente = "Agente GCM",
}: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-marca">
        <div className="dashboard-marca-icone">✦</div>
        <span>SENTINELA</span>
      </div>

      <div className="dashboard-usuario">
        <span className="dashboard-usuario-nome">
          {nomeAgente}
        </span>

        <div className="dashboard-avatar" aria-hidden="true">
          {nomeAgente.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
