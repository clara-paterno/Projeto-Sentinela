
import type { Request, Response } from "express";
import { loginSchema } from "../schemas/auth.schema.js";
import { loginService } from "../services/auth.services.js";

export async function login(
  req: Request,
  res: Response
) {
  const validacao = loginSchema.safeParse(req.body);

  if (!validacao.success) {
    res.status(400).json({
      mensagem: "Dados de login inválidos",
      erros: validacao.error.flatten()
    });
    return;
  }

  const resultado = await loginService(validacao.data);

  if (!resultado) {
    res.status(401).json({
      mensagem: "Credenciais inválidas"
    });
    return;
  }

  res.status(200).json(resultado);
}
