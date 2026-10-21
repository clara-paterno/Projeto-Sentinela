
import {
  describe, it, expect, vi, beforeEach
} from "vitest";

const mocks = vi.hoisted(() => ({
  transacao: vi.fn(),
  bloquear: vi.fn(),
  buscar: vi.fn(),
  atualizar: vi.fn(),
  criarHistorico: vi.fn()
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    $transaction: mocks.transacao
  }
}));

import { atualizarStatusSchema } from "../schemas/status.schema.js";
import { atualizarStatusGcmService } from "../services/gcm.services.js";

const id = "735098b2-65ad-4532-a024-6187fd212951";
const agenteId = "226b935c-bb24-43f9-beb8-32c2b5e48ed7";

beforeEach(() => {
  vi.clearAllMocks();

  mocks.bloquear.mockResolvedValue([{ id }]);

  mocks.buscar.mockResolvedValue({
    status: "RECEBIDA"
  });

  mocks.atualizar.mockResolvedValue({
    id,
    protocolo: "d6268697-c947-4ef1-9662-8a3d4a39d336",
    status: "EM_ANALISE",
    atualizadaEm: new Date()
  });

  mocks.criarHistorico.mockResolvedValue({
    id: "historico-teste"
  });

  const tx = {
    $queryRaw: mocks.bloquear,
    solicitacao: {
      findUniqueOrThrow: mocks.buscar,
      update: mocks.atualizar
    },
    historicoStatus: {
      create: mocks.criarHistorico
    }
  };

  mocks.transacao.mockImplementation(
    async (callback) => callback(tx)
  );
});

describe("Validação de status", () => {
  it("exige justificativa ao encerrar sem atendimento", () => {
    const resultado = atualizarStatusSchema.safeParse({
      status: "ENCERRADA_SEM_ATENDIMENTO"
    });

    expect(resultado.success).toBe(false);
  });

  it("aceita encerramento com justificativa", () => {
    const resultado = atualizarStatusSchema.safeParse({
      status: "ENCERRADA_SEM_ATENDIMENTO",
      observacao: "Atendimento não realizado por falta de informações"
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita status inexistente", () => {
    const resultado = atualizarStatusSchema.safeParse({
      status: "CANCELADA"
    });

    expect(resultado.success).toBe(false);
  });
});

describe("Atualização de status da GCM", () => {
  it("permite RECEBIDA para EM_ANALISE", async () => {
    const resultado = await atualizarStatusGcmService(
      id,
      agenteId,
      { status: "EM_ANALISE" }
    );

    expect(resultado).toHaveProperty("solicitacao");
    expect(mocks.atualizar).toHaveBeenCalledOnce();
    expect(mocks.criarHistorico).toHaveBeenCalledOnce();
  });

  it("registra agente e estados no histórico", async () => {
    await atualizarStatusGcmService(
      id,
      agenteId,
      {
        status: "EM_ANALISE",
        observacao: "Solicitação em análise"
      }
    );

    expect(mocks.criarHistorico).toHaveBeenCalledWith({
      data: {
        solicitacaoId: id,
        agenteId,
        statusAnterior: "RECEBIDA",
        statusNovo: "EM_ANALISE",
        observacao: "Solicitação em análise"
      }
    });
  });

  it("proíbe pular EM_ATENDIMENTO", async () => {
    mocks.buscar.mockResolvedValue({
      status: "EM_ANALISE"
    });

    const resultado = await atualizarStatusGcmService(
      id,
      agenteId,
      { status: "CONCLUIDA" }
    );

    expect(resultado).toEqual({
      erro: "TRANSICAO_INVALIDA"
    });

    expect(mocks.atualizar).not.toHaveBeenCalled();
    expect(mocks.criarHistorico).not.toHaveBeenCalled();
  });

  it("impede alterações após conclusão", async () => {
    mocks.buscar.mockResolvedValue({
      status: "CONCLUIDA"
    });

    const resultado = await atualizarStatusGcmService(
      id,
      agenteId,
      { status: "EM_ANALISE" }
    );

    expect(resultado).toEqual({
      erro: "TRANSICAO_INVALIDA"
    });
  });

  it("permite encerrar sem atendimento a partir de RECEBIDA", async () => {
    const resultado = await atualizarStatusGcmService(
      id,
      agenteId,
      {
        status: "ENCERRADA_SEM_ATENDIMENTO",
        observacao: "Solicitação duplicada"
      }
    );

    expect(resultado).toHaveProperty("solicitacao");
    expect(mocks.criarHistorico).toHaveBeenCalledOnce();
  });

  it("não altera uma solicitação inexistente", async () => {
    mocks.bloquear.mockResolvedValue([]);

    const resultado = await atualizarStatusGcmService(
      id,
      agenteId,
      { status: "EM_ANALISE" }
    );

    expect(resultado).toEqual({
      erro: "NAO_ENCONTRADA"
    });

    expect(mocks.atualizar).not.toHaveBeenCalled();
  });
});
