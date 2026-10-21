import { Router } from "express";

import { autenticarAgente } from "../middlewares/auth.middleware.js";
import { visualizarAnexoGcm } from "../controllers/anexo.controller.js";

import { uploadImagens } from "../middlewares/upload.middleware.js";
import { anexarImagem } from "../controllers/anexo.controller.js";

const router = Router();

router.post(
  "/solicitacoes/anexos",
  uploadImagens,
  anexarImagem
);

router.get(
  "/gcm/anexos/:id",
  autenticarAgente,
  visualizarAnexoGcm
)

export default router;
