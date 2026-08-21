import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const toDataURLMock = vi.fn(() => "data:image/jpeg;base64,fake");
const html2canvasMock = vi.fn(async () => ({
  width: 800,
  height: 400,
  toDataURL: toDataURLMock,
}));

const addImageMock = vi.fn();
const outputMock = vi.fn(() => new Blob(["pdf-bytes"], { type: "application/pdf" }));

vi.mock("html2canvas-pro", () => ({
  default: (...args: unknown[]) => html2canvasMock(...args),
}));

vi.mock("jspdf", () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    addImage: addImageMock,
    output: outputMock,
  })),
}));

import { gerarPdfRecibo, compartilharOuBaixarPdf } from "./pdf";

describe("gerarPdfRecibo", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="receipt-print">recibo</div>';
    html2canvasMock.mockClear();
    addImageMock.mockClear();
  });

  it("lança erro quando o elemento do recibo não existe na página", async () => {
    document.body.innerHTML = "";
    await expect(gerarPdfRecibo("recibo.pdf")).rejects.toThrow(
      "Recibo não encontrado na página"
    );
  });

  it("gera um File de PDF a partir do elemento capturado", async () => {
    const file = await gerarPdfRecibo("recibo-015-2026.pdf");
    expect(html2canvasMock).toHaveBeenCalled();
    expect(addImageMock).toHaveBeenCalled();
    expect(file.name).toBe("recibo-015-2026.pdf");
    expect(file.type).toBe("application/pdf");
  });
});

describe("compartilharOuBaixarPdf", () => {
  const originalShare = navigator.share;
  const originalCanShare = navigator.canShare;

  beforeEach(() => {
    document.body.innerHTML = '<div id="receipt-print">recibo</div>';
  });

  afterEach(() => {
    // @ts-expect-error - restaurar API do navegador entre testes
    navigator.share = originalShare;
    // @ts-expect-error - restaurar API do navegador entre testes
    navigator.canShare = originalCanShare;
    // Não usar vi.restoreAllMocks() aqui: isso zeraria os mocks dos módulos
    // html2canvas-pro/jspdf definidos no topo do arquivo, quebrando os testes
    // seguintes. Restauramos apenas os spies criados dentro de cada teste.
  });

  it("usa Web Share API quando disponível (fluxo mobile)", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    // @ts-expect-error - simular suporte à Web Share API no teste
    navigator.canShare = vi.fn(() => true);
    // @ts-expect-error - simular suporte à Web Share API no teste
    navigator.share = shareMock;

    const resultado = await compartilharOuBaixarPdf("recibo.pdf", "Recibo #1");

    expect(shareMock).toHaveBeenCalled();
    expect(resultado).toBe("compartilhado");
  });

  it("trata cancelamento do compartilhamento sem cair no download", async () => {
    // @ts-expect-error - simular suporte à Web Share API no teste
    navigator.canShare = vi.fn(() => true);
    // @ts-expect-error - simular usuário cancelando o compartilhamento
    navigator.share = vi.fn().mockRejectedValue(
      Object.assign(new Error("cancelled"), { name: "AbortError" })
    );

    const resultado = await compartilharOuBaixarPdf("recibo.pdf", "Recibo #1");
    expect(resultado).toBe("compartilhado");
  });

  it("baixa o arquivo quando a Web Share API não está disponível (fluxo desktop)", async () => {
    // @ts-expect-error - remover suporte à Web Share API no teste
    navigator.canShare = undefined;
    // @ts-expect-error - remover suporte à Web Share API no teste
    navigator.share = undefined;

    const clickMock = vi.fn();
    const createObjectURL = vi.fn(() => "blob:fake-url");
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        const el = originalCreateElement(tag);
        if (tag === "a") el.click = clickMock;
        return el;
      });

    const resultado = await compartilharOuBaixarPdf("recibo.pdf", "Recibo #1");

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
    expect(resultado).toBe("baixado");

    createElementSpy.mockRestore();
  });
});
