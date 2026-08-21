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

      <div style={{ padding: "40px 44px 48px" }}>
        {/* Valor em destaque */}
        <div
          style={{
            background: "linear-gradient(135deg, #fffbeb 0%, #fff 100%)",
            border: "1px solid #fde68a",
            borderRadius: "12px",
            textAlign: "center",
            padding: "26px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "3px",
              color: "#92400e",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Valor recebido
          </p>
          <p
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: INK,
              margin: "6px 0 4px",
            }}
          >
            {valorFormatado}
          </p>
          <p style={{ fontSize: "13px", color: "#78350f", fontStyle: "italic" }}>
            ({extenso})
          </p>
        </div>

        {/* Texto explicativo do recibo */}
        <p
          style={{
            fontSize: "14.5px",
            lineHeight: 1.9,
            textAlign: "justify",
            marginTop: "28px",
            color: "#1e293b",
          }}
        >
          Eu, <strong>{profile.company_name || "___________________"}</strong>
          {profile.cpf_cnpj && (
            <>
              , inscrito(a) no CPF/CNPJ sob o nº{" "}
              <strong>{profile.cpf_cnpj}</strong>
            </>
          )}
          , declaro que recebi de <strong>{receipt.client_name}</strong>
          {receipt.client_cpf_cnpj && (
            <>
              , inscrito(a) no CPF/CNPJ sob o nº{" "}
              <strong>{receipt.client_cpf_cnpj}</strong>
            </>
          )}
          , a importância de <strong>{valorFormatado}</strong> ({extenso}),
          referente a:
        </p>

        {receipt.description && (
          <div
            style={{
              borderLeft: `3px solid ${GOLD}`,
              backgroundColor: "#f8fafc",
              borderRadius: "0 8px 8px 0",
              padding: "14px 18px",
              margin: "16px 0 0",
              fontSize: "14px",
            }}
          >
            {receipt.description}
          </div>
        )}

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

        <p style={{ fontSize: "14px", color: "#475569", marginTop: "22px" }}>
          Para maior clareza, firmo o presente recibo para que produza os seus
          efeitos legais.
        </p>

        <p
          style={{
            fontSize: "13px",
            color: "#64748b",
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          {profile.city ? `${profile.city}, ` : ""}
          {dataPorExtenso(receipt.receipt_date)}
        </p>

        {/* Assinatura — bem mais abaixo, em bloco próprio */}
        <div
          style={{
            marginTop: "72px",
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
