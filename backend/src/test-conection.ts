import { prisma } from "./lib/prisma.js";

async function main() {
  const total = await prisma.solicitacao.count();

  console.log(`Total de solicitações: ${total}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });