
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const nome = process.env.SEED_AGENTE_NOME?.trim();
  const email = process.env.SEED_AGENTE_EMAIL?.trim().toLowerCase();
  const senha = process.env.SEED_AGENTE_SENHA;

  if (!nome || !email || !senha || senha.length < 12) {
    throw new Error(
      "Configure SEED_AGENTE_NOME, SEED_AGENTE_EMAIL e SEED_AGENTE_SENHA (mínimo de 12 caracteres)"
    );
  }

  const existente = await prisma.agente.findUnique({
    where: { email }
  });
if (existente) {
  const senhaHash = await bcrypt.hash(senha, 12);

  await prisma.agente.update({
    where: { email },
    data: { senhaHash }
  });

  console.log("Senha do agente atualizada com sucesso.");
  return;
}

  const senhaHash = await bcrypt.hash(senha, 12);

  const agente = await prisma.agente.create({
    data: {
      nome,
      email,
      senhaHash,
      ativo: true
    },
    select: {
      id: true,
      nome: true,
      email: true
    }
  });

  console.log("Agente criado:", agente);
}

main()
  .catch((erro) => {
    console.error("Erro ao criar agente:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
