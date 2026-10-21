import { describe, it, expect } from "vitest";
import { criarSolicitacaoSchema } from "../schemas/solicitacao.schema.js";

const categoriaId = "226b935c-bb24-43f9-beb8-32c2b5e48ed7";

const denunciaAnonima = {
  tipo: "DENUNCIA",
  descricao: "Perturbação do sossego durante a noite",
  categoriaId,
  anonima: true,
  enderecoOcorrencia: "Centro, Piquet Carneiro"
};

const ocorrenciaIdentificada = {
  tipo: "OCORRENCIA",
  descricao: "Solicitação de atendimento da GCM",
  categoriaId,
  anonima: false,
  enderecoOcorrencia: "Centro, Piquet Carneiro",
  solicitanteNome: "Pessoa de Teste",
  solicitanteEnderecoResidencial: "Rua de Teste, 123",
  solicitanteTelefone: "85999999999"
};

describe("Validação de solicitações", () => {
  it("aceita denúncia anônima", () => {
    const resultado = criarSolicitacaoSchema.safeParse(
      denunciaAnonima
    );

    expect(resultado.success).toBe(true);
  });

  it("aceita denúncia identificada com dados completos", () => {
    const resultado = criarSolicitacaoSchema.safeParse({
      ...ocorrenciaIdentificada,
      tipo: "DENUNCIA"
    });

    expect(resultado.success).toBe(true);
  });

  it("aceita ocorrência identificada", () => {
    const resultado = criarSolicitacaoSchema.safeParse(
      ocorrenciaIdentificada
    );

    expect(resultado.success).toBe(true);
  });

  it("rejeita ocorrência anônima", () => {
    const resultado = criarSolicitacaoSchema.safeParse({
      ...ocorrenciaIdentificada,
      anonima: true,
      solicitanteNome: undefined,
      solicitanteEnderecoResidencial: undefined,
      solicitanteTelefone: undefined
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues.some(
        issue => issue.message ===
          "Apenas denúncias podem ser anônimas"
      )).toBe(true);
    }
  });

  it("rejeita denúncia anônima com dados pessoais", () => {
    const resultado = criarSolicitacaoSchema.safeParse({
      ...denunciaAnonima,
      solicitanteNome: "Pessoa de Teste"
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues.some(
        issue => issue.message.includes(
          "Denúncias anônimas não devem conter dados pessoais"
        )
      )).toBe(true);
    }
  });

  it("rejeita solicitação sem localização", () => {
    const resultado = criarSolicitacaoSchema.safeParse({
      ...denunciaAnonima,
      enderecoOcorrencia: undefined
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues.some(
        issue => issue.message.includes(
          "Informe um endereço ou latitude e longitude"
        )
      )).toBe(true);
    }
  });

  it("rejeita localização com apenas latitude", () => {
    const resultado = criarSolicitacaoSchema.safeParse({
      ...denunciaAnonima,
      enderecoOcorrencia: undefined,
      latitude: -5.8
    });

    expect(resultado.success).toBe(false);
  });

  it("aceita localização com latitude e longitude", () => {
    const resultado = criarSolicitacaoSchema.safeParse({
      ...denunciaAnonima,
      enderecoOcorrencia: undefined,
      latitude: -5.8,
      longitude: -39.4
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita identificação sem contato", () => {
    const resultado = criarSolicitacaoSchema.safeParse({
      ...ocorrenciaIdentificada,
      solicitanteTelefone: undefined
    });

    expect(resultado.success).toBe(false);

    if (!resultado.success) {
      expect(resultado.error.issues.some(
        issue => issue.message.includes(
          "pelo menos um contato"
        )
      )).toBe(true);
    }
  });

  it("rejeita tipo de solicitação inválido", () => {
    const resultado = criarSolicitacaoSchema.safeParse({
      ...denunciaAnonima,
      tipo: "OUTRO"
    });

    expect(resultado.success).toBe(false);
  });

  it("rejeita descrição vazia", () => {
    const resultado = criarSolicitacaoSchema.safeParse({
      ...denunciaAnonima,
      descricao: "   "
    });

    expect(resultado.success).toBe(false);
  });
});
