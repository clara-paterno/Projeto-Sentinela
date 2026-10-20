
import { prisma } from "../src/lib/prisma.js";
import type { TipoSolicitacao } from "../src/generated/prisma/client.js";

const categorias: {
  nome: string;
  descricao: string;
  tipo: TipoSolicitacao;
}[] = [
  //categorias de denúncia
  {
    nome: "Perturbação do sossego",
    descricao: "Barulho excessivo e perturbação da tranquilidade pública",
    tipo: "DENUNCIA"
  },
  {
    nome: "Descarte irregular de lixo",
    descricao: "Descarte inadequado de resíduos em espaços públicos",
    tipo: "DENUNCIA"
  },
  {
    nome: "Vandalismo",
    descricao: "Danos ao patrimônio público ou privado",
    tipo: "DENUNCIA"
  },
  {
    nome: "Ocupação irregular de espaço público",
    descricao: "Utilização irregular de ruas, praças e outros espaços públicos",
    tipo: "DENUNCIA"
  },
  {
    nome: "Iluminação pública comprometida",
    descricao: "Problemas de iluminação que possam comprometer a segurança",
    tipo: "DENUNCIA"
  },
  {
    nome: "Outras denúncias",
    descricao: "Situações que não se enquadram nas categorias disponíveis",
    tipo: "DENUNCIA"
  },
  
  //categorias de ocorrência
  {
    nome: "Acidente de trânsito",
    descricao: "Ocorrências envolvendo veículos e acidentes de trânsito",
    tipo: "OCORRENCIA"
  },
  {
    nome: "Acidente com vítima",
    descricao: "Acidentes que envolvam pessoas feridas",
    tipo: "OCORRENCIA"
  },
  {
    nome: "Apoio à população",
    descricao: "Solicitações de assistência ou apoio da GCM",
    tipo: "OCORRENCIA"
  },
  {
    nome: "Animal em situação de risco",
    descricao: "Situações envolvendo animais em perigo",
    tipo: "OCORRENCIA"
  },
  {
    nome: "Situação de risco",
    descricao: "Ocorrências que representem risco à segurança da população",
    tipo: "OCORRENCIA"
  },
  {
    nome: "Outras ocorrências",
    descricao: "Solicitações que não se enquadram nas demais categorias",
    tipo: "OCORRENCIA"
  }
];

async function main() {
  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: {
        nome_tipo: {
          nome: categoria.nome,
          tipo: categoria.tipo
        }
      },
      update: {},
      create: categoria
    });
  }

  console.log(`${categorias.length} categorias verificadas/cadastradas.`);
}

main()
  .catch((erro) => {
    console.error("Erro ao executar seed:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
