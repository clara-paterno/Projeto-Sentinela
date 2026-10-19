import { Router } from "express";
import { criarSolicitacao } from "../controllers/solicitacao.controller.js";

const router = Router();

router.post("/solicitacoes", criarSolicitacao);

export default router;