
import { useEffect, useState } from "react";

type AnexoImagemProps = {
  id: string;
  nome: string;
  token: string;
};

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export default function AnexoImagem({
  id,
  nome,
  token,
}: AnexoImagemProps) {
  const [imagem, setImagem] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    let urlTemporaria: string | null = null;

    async function carregarImagem() {
      setCarregando(true);
      setErro(false);
      setImagem(null);

      try {
        const resposta = await fetch(
          `${API_URL}/gcm/anexos/${encodeURIComponent(id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resposta.ok) {
          throw new Error("Erro ao carregar imagem.");
        }

        const blob = await resposta.blob();

        if (!blob.type.startsWith("image/")) {
          throw new Error("O anexo não é uma imagem.");
        }

        if (!ativo) return;

        urlTemporaria = URL.createObjectURL(blob);
        setImagem(urlTemporaria);
      } catch {
        if (ativo) setErro(true);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarImagem();

    return () => {
      ativo = false;

      if (urlTemporaria) {
        URL.revokeObjectURL(urlTemporaria);
      }
    };
  }, [id, token]);

  if (carregando) {
    return <p>Carregando imagem...</p>;
  }

  if (erro || !imagem) {
    return <p>Não foi possível carregar o anexo: {nome}</p>;
  }

  return (
    <div>
      <img
        src={imagem}
        alt={nome}
        style={{
          maxWidth: "100%",
          maxHeight: 320,
          borderRadius: 12,
          objectFit: "contain",
        }}
      />
      <p>{nome}</p>
    </div>
  );
}
