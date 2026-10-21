
import {
  describe, it, expect, vi
} from "vitest";
import express from "express";
import request from "supertest";

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    solicitacao: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock("../lib/cloudinary.js", () => ({
  cloudinary: {
    uploader: {
      upload_stream: vi.fn()
    }
  }
}));

import { uploadImagens } from "../middlewares/upload.middleware.js";
import {
  adicionarAnexosService,
  ErroAnexo
} from "../services/anexo.services.js";

const app = express();

app.post("/upload", uploadImagens, (req, res) => {
  const arquivos = req.files as Express.Multer.File[];

  res.status(200).json({
    quantidade: arquivos.length
  });
});

const imagemTeste = Buffer.from([
  137, 80, 78, 71, 13, 10, 26, 10
]);

describe("Validações do Multer", () => {
  it("aceita uma imagem PNG", async () => {
    const resposta = await request(app)
      .post("/upload")
      .attach("imagens", imagemTeste, {
        filename: "teste.png",
        contentType: "image/png"
      });

    expect(resposta.status).toBe(200);
    expect(resposta.body.quantidade).toBe(1);
  });

  it("rejeita arquivo TXT", async () => {
    const resposta = await request(app)
      .post("/upload")
      .attach("imagens", Buffer.from("teste"), {
        filename: "teste.txt",
        contentType: "text/plain"
      });

    expect(resposta.status).toBe(400);
    expect(resposta.body.mensagem).toBe(
      "Formato de imagem não permitido"
    );
  });

  it("rejeita arquivo maior que 5 MB", async () => {
    const arquivoGrande = Buffer.alloc(
      5 * 1024 * 1024 + 1
    );

    const resposta = await request(app)
      .post("/upload")
      .attach("imagens", arquivoGrande, {
        filename: "grande.png",
        contentType: "image/png"
      });

    expect(resposta.status).toBe(413);
  });

  it("rejeita mais de três imagens", async () => {
    let requisicao = request(app).post("/upload");

    for (let i = 0; i < 4; i++) {
      requisicao = requisicao.attach(
        "imagens",
        imagemTeste,
        {
          filename: `teste${i}.png`,
          contentType: "image/png"
        }
      );
    }

    const resposta = await requisicao;

    expect(resposta.status).toBe(400);
    expect([
      "LIMIT_FILE_COUNT",
      "LIMIT_UNEXPECTED_FILE"
    ]).toContain(resposta.body.codigo);
  });
});

describe("Validações do service de anexos", () => {
  it("rejeita lista de arquivos vazia", async () => {
    await expect(
      adicionarAnexosService(
        "protocolo-teste",
        "codigo-teste",
        []
      )
    ).rejects.toMatchObject({
      status: 400,
      message: "Envie de 1 a 3 imagens"
    });
  });

  it("rejeita conteúdo falsificado", async () => {
    const arquivoFalso = {
      buffer: Buffer.from("Isto nao e uma imagem"),
      mimetype: "image/webp",
      originalname: "falso.webp",
      size: 22
    } as Express.Multer.File;

    await expect(
      adicionarAnexosService(
        "protocolo-teste",
        "codigo-teste",
        [arquivoFalso]
      )
    ).rejects.toBeInstanceOf(ErroAnexo);
  });
});
