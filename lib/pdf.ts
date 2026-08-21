"use client";

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/** Captura o elemento do recibo e gera um PDF A4 como File. */
export async function gerarPdfRecibo(nomeArquivo: string): Promise<File> {
  const el = document.getElementById("receipt-print");
  if (!el) throw new Error("Recibo não encontrado na página");

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 10;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const finalHeight = Math.min(imgHeight, pageHeight - margin * 2);
  const finalWidth =
    imgHeight > pageHeight - margin * 2
      ? (canvas.width * finalHeight) / canvas.height
      : imgWidth;

  pdf.addImage(
    canvas.toDataURL("image/jpeg", 0.95),
    "JPEG",
    (pageWidth - finalWidth) / 2,
    margin,
    finalWidth,
    finalHeight
  );

  const blob = pdf.output("blob");
  return new File([blob], nomeArquivo, { type: "application/pdf" });
}

/** Compartilha o PDF (Web Share API no celular) ou baixa o arquivo (desktop). */
export async function compartilharOuBaixarPdf(
  nomeArquivo: string,
  titulo: string
): Promise<"compartilhado" | "baixado"> {
  const file = await gerarPdfRecibo(nomeArquivo);

  if (
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: titulo });
      return "compartilhado";
    } catch (e) {
      // Usuário cancelou o compartilhamento — não baixa
      if ((e as DOMException).name === "AbortError") return "compartilhado";
    }
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
  return "baixado";
}
