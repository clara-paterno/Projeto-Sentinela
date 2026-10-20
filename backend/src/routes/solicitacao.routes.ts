
import { Router } from "express";
import {
  criarSolicitacao,
  consultarSolicitacao
} from "../controllers/solicitacao.controller.js";

const router = Router();

router.post("/solicitacoes", criarSolicitacao);
router.post("/solicitacoes/consulta", consultarSolicitacao);

export default router;
