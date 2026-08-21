import { describe, expect, it } from "vitest";
import { validarNovaSenha } from "./validacaoSenha";

describe("validarNovaSenha", () => {
  it("rejeita senha com menos de 6 caracteres", () => {
    expect(validarNovaSenha("123", "123")).toBe(
      "A senha deve ter pelo menos 6 caracteres."
    );
  });

  it("rejeita quando a confirmação não bate com a senha", () => {
    expect(validarNovaSenha("123456", "654321")).toBe(
      "As senhas não coincidem."
    );
  });

  it("aceita senha válida e confirmação idêntica", () => {
    expect(validarNovaSenha("123456", "123456")).toBeNull();
  });

  it("prioriza o erro de tamanho mínimo sobre o de confirmação", () => {
    expect(validarNovaSenha("123", "456")).toBe(
      "A senha deve ter pelo menos 6 caracteres."
    );
  });
});
