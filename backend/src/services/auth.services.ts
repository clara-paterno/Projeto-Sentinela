
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { LoginInput } from "../schemas/auth.schema.js";

export async function loginService(dados: LoginInput) {
  const agente = await prisma.agente.findUnique({
    where: {
      email: dados.email.trim().toLowerCase()
    }
  });

  if (!agente || !agente.ativo) {
    return null;
  }

  const senhaValida = await bcrypt.compare(
    dados.senha,
    agente.senhaHash
  );

  if (!senhaValida) {
    return null;
  }

  const segredo = process.env.JWT_SECRET;

  if (!segredo || segredo.length < 32) {
    throw new Error("JWT_SECRET não configurado corretamente");
  }

  const token = jwt.sign(
    {},
    segredo,
    {
      subject: agente.id,
      expiresIn: "2h",
      algorithm: "HS256"
    }
  );

  return {
    token,
    tokenType: "Bearer",
    agente: {
      id: agente.id,
      nome: agente.nome,
      email: agente.email
    }
  };
}
