import { describe, expect, it } from "vitest";
import { dataPorExtenso, formatarMoeda, valorPorExtenso } from "./extenso";

describe("valorPorExtenso", () => {
  it("converte um valor exato do exemplo do sistema (5700 -> cinco mil e setecentos reais)", () => {
    expect(valorPorExtenso(5700)).toBe("Cinco mil e setecentos reais");
  });

  it("trata zero reais", () => {
    expect(valorPorExtenso(0)).toBe("Zero reais");
  });

  it("usa singular para um real", () => {
    expect(valorPorExtenso(1)).toBe("Um real");
  });

  it("inclui centavos quando presentes", () => {
    expect(valorPorExtenso(10.5)).toBe("Dez reais e cinquenta centavos");
  });

  it("usa singular para um centavo", () => {
    expect(valorPorExtenso(0.01)).toBe("Um centavo");
  });

  it("converte centenas simples", () => {
    expect(valorPorExtenso(100)).toBe("Cem reais");
  });

  it("converte números com centena + dezena + unidade", () => {
    expect(valorPorExtenso(999)).toBe("Novecentos e noventa e nove reais");
  });

  it("converte milhares exatos", () => {
    expect(valorPorExtenso(1000)).toBe("Mil reais");
  });

  it("converte milhões", () => {
    expect(valorPorExtenso(1_000_000)).toBe("Um milhão reais");
  });

  it("arredonda centavos corretamente (evita erro de ponto flutuante)", () => {
    expect(valorPorExtenso(19.9)).toBe("Dezenove reais e noventa centavos");
  });
});

describe("formatarMoeda", () => {
  // Usa regex (\s casa espaco normal e non-breaking space) porque o ICU do
  // ambiente pode inserir um non-breaking space entre "R$" e o valor.
  it("formata como moeda brasileira", () => {
    expect(formatarMoeda(5700)).toMatch(/^R\$\s5\.700,00$/);
  });

  it("formata valores com centavos", () => {
    expect(formatarMoeda(19.9)).toMatch(/^R\$\s19,90$/);
  });
});

describe("dataPorExtenso", () => {
  it("formata data ISO em portugues por extenso", () => {
    expect(dataPorExtenso("2026-03-21")).toBe("21 de março de 2026");
  });

  it("nao sofre problema de fuso horario (dia nao regride)", () => {
    // Um erro comum e usar `new Date("2026-01-01")` (UTC) e exibir 31/12 em fusos negativos.
    expect(dataPorExtenso("2026-01-01")).toBe("1 de janeiro de 2026");
  });
});
