import { prisma } from "../lib/prisma.js";

export async function listarCategoriasService() {
  return prisma.categoria.findMany({
    where: {
      ativa: true
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      tipo: true
    },
    orderBy: {
      nome: "asc"
    }
  });
}
