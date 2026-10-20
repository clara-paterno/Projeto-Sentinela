import type { Request, Response } from "express";
import { listarCategoriasService } from "../services/categoria.services.js";

export async function listarCategorias(
  req: Request,
  res: Response
) {
  const categorias = await listarCategoriasService();

  res.status(200).json(categorias);
}
