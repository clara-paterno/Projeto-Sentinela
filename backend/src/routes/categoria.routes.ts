import { Router } from "express";
import { listarCategorias } from "../controllers/categoria.controller.js";

const router = Router();

router.get("/categorias", listarCategorias);

export default router;
