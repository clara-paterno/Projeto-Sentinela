
import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const MAX_TAMANHO = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_TAMANHO,
    files: 3,
    fields: 2,
    parts: 5
  },

  fileFilter: (_req, file, cb) => {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
      cb(new Error("Formato de imagem não permitido"));
      return;
    }

    cb(null, true);
  }
}).array("imagens", 3);

export function uploadImagens(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload(req, res, (erro: unknown) => {
    if (!erro) {
      next();
      return;
    }

    if (erro instanceof multer.MulterError) {
      if (erro.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
          mensagem: "Imagem excede o limite de 5 MB"
        });
        return;
      }

      res.status(400).json({
        mensagem: "Limite de arquivos ou campos excedido",
        codigo: erro.code
      });
      return;
    }

    if (
      erro instanceof Error &&
      erro.message === "Formato de imagem não permitido"
    ) {
      res.status(400).json({
        mensagem: erro.message
      });
      return;
    }

    next(erro);
  });
}
