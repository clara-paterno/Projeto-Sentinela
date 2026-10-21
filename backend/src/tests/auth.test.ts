import { describe, it, expect } from "vitest";
import { loginSchema } from "../schemas/auth.schema.js";

describe("Validação de login da GCM", () => {
  it("aceita credenciais com formato válido", () => {
    const resultado = loginSchema.safeParse({
      email: "agente@exemplo.com",
      senha: "SenhaDeTeste123"
    });

    expect(resultado.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const resultado = loginSchema.safeParse({
      email: "email-invalido",
      senha: "SenhaDeTeste123"
    });

    expect(resultado.success).toBe(false);
  });

  it("rejeita senha ausente", () => {
    const resultado = loginSchema.safeParse({
      email: "agente@exemplo.com"
    });

    expect(resultado.success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const resultado = loginSchema.safeParse({
      email: "agente@exemplo.com",
      senha: ""
    });

    expect(resultado.success).toBe(false);
  });
});