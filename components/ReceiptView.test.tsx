import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ReceiptView from "./ReceiptView";
import type { Profile, Receipt } from "@/lib/types";

const profileBase: Profile = {
  id: "user-1",
  company_name: "Empresa Exemplo Ltda",
  cpf_cnpj: "12.345.678/0001-90",
  city: "Brasília - DF",
  signature_url: "https://example.com/assinatura.png",
  logo_url: null,
};

const receiptBase: Receipt = {
  id: "r1",
  user_id: "user-1",
  number: 15,
  year: 2026,
  client_name: "Cliente Teste",
  client_cpf_cnpj: "987.654.321-00",
  amount: 5700,
  description: "Serviço de teste",
  payment_method: "PIX",
  receipt_date: "2026-03-21",
  show_signature: true,
  created_at: "2026-03-21T00:00:00.000Z",
};

describe("ReceiptView", () => {
  it("exibe o número do recibo formatado", () => {
    render(<ReceiptView receipt={receiptBase} profile={profileBase} />);
    expect(screen.getByText("Nº 015/2026")).toBeInTheDocument();
  });

  it("exibe o valor formatado em reais e por extenso", () => {
    render(<ReceiptView receipt={receiptBase} profile={profileBase} />);
    // O valor aparece duas vezes: no destaque e na frase de declaração.
    expect(screen.getAllByText("R$ 5.700,00").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText("(Cinco mil e setecentos reais)")
    ).toBeInTheDocument();
  });

  it("exibe o nome do cliente e da empresa na declaração", () => {
    render(<ReceiptView receipt={receiptBase} profile={profileBase} />);
    expect(screen.getByText("Cliente Teste")).toBeInTheDocument();
    expect(screen.getAllByText("Empresa Exemplo Ltda").length).toBeGreaterThan(0);
  });

  it("mostra a imagem da assinatura quando show_signature é true e há assinatura salva", () => {
    render(<ReceiptView receipt={receiptBase} profile={profileBase} />);
    expect(screen.getByAltText("Assinatura")).toBeInTheDocument();
  });

  it("esconde a assinatura quando show_signature é false", () => {
    render(
      <ReceiptView
        receipt={{ ...receiptBase, show_signature: false }}
        profile={profileBase}
      />
    );
    expect(screen.queryByAltText("Assinatura")).not.toBeInTheDocument();
  });

  it("esconde a assinatura quando o perfil não tem imagem salva, mesmo com show_signature true", () => {
    render(
      <ReceiptView
        receipt={receiptBase}
        profile={{ ...profileBase, signature_url: null }}
      />
    );
    expect(screen.queryByAltText("Assinatura")).not.toBeInTheDocument();
  });

  it("mostra a logo quando o perfil tem logo_url", () => {
    render(
      <ReceiptView
        receipt={receiptBase}
        profile={{ ...profileBase, logo_url: "https://example.com/logo.png" }}
      />
    );
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

  it("não mostra a logo quando o perfil não tem logo_url", () => {
    render(<ReceiptView receipt={receiptBase} profile={profileBase} />);
    expect(screen.queryByAltText("Logo")).not.toBeInTheDocument();
  });

  it("não quebra quando não há descrição nem forma de pagamento", () => {
    render(
      <ReceiptView
        receipt={{ ...receiptBase, description: null, payment_method: null }}
        profile={profileBase}
      />
    );
    expect(screen.getByText("Nº 015/2026")).toBeInTheDocument();
  });
});
