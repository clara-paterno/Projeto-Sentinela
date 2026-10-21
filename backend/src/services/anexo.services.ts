import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import { prisma } from "../lib/prisma.js";
import { cloudinary } from "../lib/cloudinary.js";

type ArquivoImagem = Express.Multer.File;

export class ErroAnexo extends Error {
  constructor(
    public status: number,
    mensagem: string
  ) {
    super(mensagem);
  }
}

// Confere o conteúdo real do arquivo
function imagemValida(buffer: Buffer, mimetype: string) {
  const jpeg =
    buffer.length >= 3 &&
    buffer.subarray(0, 3).equals(
      Buffer.from([0xff, 0xd8, 0xff])
    );

  const png =
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    );

  const webp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  return (
    (mimetype === "image/jpeg" && jpeg) ||
    (mimetype === "image/png" && png) ||
    (mimetype === "image/webp" && webp)
  );
}

// Envia o arquivo para armazenamento privado
function enviarImagem(arquivo: ArquivoImagem): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "sentinela/denuncias",
        public_id: randomUUID(),
        resource_type: "image",
        type: "authenticated",
        overwrite: false
      },
      (erro, resultado) => {
        if (erro || !resultado) {
          reject(erro ?? new Error("Falha no upload"));
          return;
        }

        resolve(resultado.public_id);
      }
    );

    stream.end(arquivo.buffer);
  });
}

export async function adicionarAnexosService(
  protocolo: string,
  codigoConsulta: string,
  arquivos: ArquivoImagem[]
) {
  if (arquivos.length === 0 || arquivos.length > 3) {
    throw new ErroAnexo(400, "Envie de 1 a 3 imagens");
  }

  for (const arquivo of arquivos) {
    if (!imagemValida(arquivo.buffer, arquivo.mimetype)) {
      throw new ErroAnexo(400, "Arquivo de imagem inválido");
    }
  }

  const solicitacao = await prisma.solicitacao.findUnique({
    where: { protocolo },
    select: {
      id: true,
      tipo: true,
      codigoConsultaHash: true,
      _count: {
        select: { anexos: true }
      }
    }
  });

  if (!solicitacao) {
    throw new ErroAnexo(404, "Solicitação não encontrada ou acesso inválido");
  }

  const hashInformado = scryptSync(
    codigoConsulta.toLowerCase(),
    protocolo,
    64
  );

  const hashArmazenado = Buffer.from(
    solicitacao.codigoConsultaHash,
    "hex"
  );

  if (
    hashInformado.length !== hashArmazenado.length ||
    !timingSafeEqual(hashInformado, hashArmazenado)
  ) {
    throw new ErroAnexo(404, "Solicitação não encontrada ou acesso inválido");
  }

  if (solicitacao.tipo !== "DENUNCIA") {
    throw new ErroAnexo(400, "Anexos permitidos apenas para denúncias");
  }

  if (solicitacao._count.anexos + arquivos.length > 3) {
    throw new ErroAnexo(400, "Limite de 3 imagens por denúncia");
  }

  const enviados: string[] = [];

  try {
    for (const arquivo of arquivos) {
      const publicId = await enviarImagem(arquivo);
      enviados.push(publicId);
    }

    const anexos = await prisma.$transaction(
      arquivos.map((arquivo, indice) =>
        prisma.anexo.create({
          data: {
            solicitacaoId: solicitacao.id,
            url: enviados[indice]!,
            nomeOriginal: arquivo.originalname,
            mineType: arquivo.mimetype,
            tamanhoBytes: arquivo.size
          },
          select: {
            id: true,
            nomeOriginal: true,
            tamanhoBytes: true
          }
        })
      )
    );

    return {
      mensagem: "Imagens anexadas com sucesso",
      anexos
    };
  } catch (erro) {
    // Remove uploads caso o processo falhe
    await Promise.allSettled(
      enviados.map((publicId) =>
        cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
          type: "authenticated",
          invalidate: true
        })
      )
    );

    throw erro;
  }
}

export async function obterUrlAnexoGcmService(id: string) {
  const anexo = await prisma.anexo.findUnique({
    where: { id },
    select: {
      url: true,
      mineType: true
    }
  });

  if (!anexo) {
    return null;
  }

  const formatos: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  const formato = formatos[anexo.mineType];

  if (!formato) {
    throw new Error("Formato do anexo não suportado");
  }

  const expiraEm = Math.floor(Date.now() / 1000) + 60;

  const urlAssinada = cloudinary.utils.private_download_url(
    anexo.url,
    formato,
    {
      resource_type: "image",
      type: "authenticated",
      expires_at: expiraEm,
      attachment: false
    }
  );

  return urlAssinada;
}
