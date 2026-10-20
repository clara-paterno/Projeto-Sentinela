import { Router } from "express";

import { autenticarAgente } from "../middlewares/auth.middleware.js";

import {
  listarSolicitacoesGcm,
  detalharSolicitacaoGcm,
  atualizarStatusGcm
} from "../controllers/gcm.controller.js";

const router = Router();

router.use("/gcm", autenticarAgente);

router.get("/gcm/solicitacoes", listarSolicitacoesGcm);
router.get("/gcm/solicitacoes/:id", detalharSolicitacaoGcm);

router.patch(
  "/gcm/solicitacoes/:id/status",
  atualizarStatusGcm
);

export default router;
