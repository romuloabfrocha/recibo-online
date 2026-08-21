import { describe, expect, it } from "vitest";
import { numeroRecibo } from "./types";

describe("numeroRecibo", () => {
  it("preenche o número com zeros à esquerda até 3 dígitos", () => {
    expect(numeroRecibo({ number: 5, year: 2026 })).toBe("005/2026");
  });

  it("não corta números com 3 dígitos ou mais", () => {
    expect(numeroRecibo({ number: 123, year: 2026 })).toBe("123/2026");
    expect(numeroRecibo({ number: 1234, year: 2026 })).toBe("1234/2026");
  });

  it("formata o número 15 do exemplo original como 015/2026", () => {
    expect(numeroRecibo({ number: 15, year: 2026 })).toBe("015/2026");
  });
});
