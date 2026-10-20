
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export async function autenticarAgente(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      mensagem: "Token de autenticação não fornecido"
    });
    return;
  }

  const token = authorization.slice(7);
  const segredo = process.env.JWT_SECRET;

  if (!segredo || segredo.length < 32) {
    throw new Error("JWT_SECRET não configurado corretamente");
  }

  let agenteId: string;

  try {
    const payload = jwt.verify(token, segredo, {
      algorithms: ["HS256"]
    });

    if (typeof payload === "string" ||
        typeof payload.sub !== "string") {
      res.status(401).json({
        mensagem: "Token inválido"
      });
      return;
    }

    agenteId = payload.sub;
  } catch {
    res.status(401).json({
      mensagem: "Token inválido ou expirado"
    });
    return;
  }

  const agente = await prisma.agente.findUnique({
    where: { id: agenteId },
    select: { id: true, ativo: true }
  });

  if (!agente || !agente.ativo) {
    res.status(401).json({
      mensagem: "Agente não autorizado"
    });
    return;
  }

  res.locals.agenteId = agente.id;
  next();
}
