import { valorPorExtenso, formatarMoeda, dataPorExtenso } from "@/lib/extenso";
import { numeroRecibo, type Profile, type Receipt } from "@/lib/types";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const INK = "#0f172a";
const GOLD = "#d97706";

// Estilos inline com cores hex para compatibilidade com a captura do PDF (html2canvas)
export default function ReceiptView({
  receipt,
  profile,
}: {
  receipt: Receipt;
  profile: Profile;
}) {
  const valorFormatado = formatarMoeda(Number(receipt.amount));
  const extenso = valorPorExtenso(Number(receipt.amount));
  const mostrarAssinatura = receipt.show_signature && profile.signature_url;
  const emitidoEm = `${profile.city ? `${profile.city} · ` : ""}${dataPorExtenso(receipt.receipt_date)}`;

  return (
    <div
      id="receipt-print"
      className="print-area"
      style={{
        backgroundColor: "#ffffff",
        color: INK,
        maxWidth: "700px",
        margin: "0 auto",
        fontFamily: FONT_STACK,
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      {/* Faixa de cabeçalho */}
      <div
        style={{
          backgroundColor: INK,
          padding: "28px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {profile.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo_url}
              alt="Logo"
              crossOrigin="anonymous"
              style={{
                height: "44px",
                width: "44px",
                objectFit: "contain",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                padding: "3px",
              }}
            />
          )}
          <div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
              {profile.company_name || "Empresa"}
            </p>
            {profile.cpf_cnpj && (
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                {profile.cpf_cnpj}
              </p>
            )}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "3px",
              color: "#94a3b8",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Recibo
          </p>
          <p style={{ fontSize: "20px", fontWeight: 800, color: GOLD }}>
            Nº {numeroRecibo(receipt)}
          </p>
        </div>
      </div>

      <div style={{ padding: "36px 40px 44px" }}>
        {/* Recebido de / Emitido em */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 240px" }}>
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "2px",
                color: "#94a3b8",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              Recebido de
            </p>
            <p style={{ fontSize: "15px", fontWeight: 700 }}>
              {receipt.client_name}
            </p>
            {receipt.client_cpf_cnpj && (
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                {receipt.client_cpf_cnpj}
              </p>
            )}
          </div>
          <div style={{ flex: "1 1 200px" }}>
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "2px",
                color: "#94a3b8",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              Emitido em
            </p>
            <p style={{ fontSize: "13px", color: "#334155" }}>{emitidoEm}</p>
          </div>
        </div>

        {/* Linha do item */}
        <div
          style={{
            marginTop: "24px",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              padding: "10px 16px",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontSize: "10px",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#94a3b8",
            }}
          >
            <span>Descrição</span>
            <span>Valor</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              padding: "16px",
              fontSize: "14px",
            }}
          >
            <span>{receipt.description || "Serviço prestado"}</span>
            <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
              {valorFormatado}
            </span>
          </div>
        </div>

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "18px",
            padding: "18px 20px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "10px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "2px",
                color: "#92400e",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Total recebido
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#78350f",
                fontStyle: "italic",
                marginTop: "2px",
              }}
            >
              ({extenso})
            </p>
          </div>
          <p style={{ fontSize: "30px", fontWeight: 800, color: "#78350f" }}>
            {valorFormatado}
          </p>
        </div>

        {receipt.payment_method && (
          <p style={{ marginTop: "16px" }}>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#f1f5f9",
                color: "#334155",
                fontWeight: 600,
                fontSize: "12px",
                borderRadius: "999px",
                padding: "5px 14px",
              }}
            >
              Pagamento via {receipt.payment_method}
            </span>
          </p>
        )}

        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "18px" }}>
          Este recibo comprova a quitação integral do valor acima descrito e
          produz efeitos legais.
        </p>

        {/* Assinatura — bem mais abaixo, em bloco próprio */}
        <div
          style={{
            marginTop: "88px",
            paddingTop: "24px",
            borderTop: "1px dashed #cbd5e1",
            textAlign: "center",
          }}
        >
          {mostrarAssinatura && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.signature_url!}
              alt="Assinatura"
              crossOrigin="anonymous"
              style={{
                maxHeight: "70px",
                maxWidth: "240px",
                margin: "0 auto 8px",
                display: "block",
              }}
            />
          )}
          <div
            style={{
              borderTop: "1px solid #0f172a",
              width: "260px",
              margin: "0 auto",
              paddingTop: "8px",
            }}
          >
            <p style={{ fontSize: "14px", fontWeight: 600 }}>
              {profile.company_name || "Assinatura"}
            </p>
            {profile.cpf_cnpj && (
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                {profile.cpf_cnpj}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
