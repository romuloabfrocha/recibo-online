import { valorPorExtenso, formatarMoeda, dataPorExtenso } from "@/lib/extenso";
import { numeroRecibo, type Profile, type Receipt } from "@/lib/types";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const ACCENT = "#2563eb";

// Estilos inline com cores hex para compatibilidade com a captura do PDF (html2canvas)
export default function ReceiptView({
  receipt,
  profile,
}: {
  receipt: Receipt;
  profile: Profile;
}) {
  const extenso = valorPorExtenso(Number(receipt.amount));
  const mostrarAssinatura = receipt.show_signature && profile.signature_url;

  return (
    <div
      id="receipt-print"
      className="print-area"
      style={{
        backgroundColor: "#ffffff",
        color: "#1f2937",
        maxWidth: "700px",
        margin: "0 auto",
        fontFamily: FONT_STACK,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Barra de destaque */}
      <div style={{ height: "8px", backgroundColor: ACCENT }} />

      <div style={{ padding: "40px 48px" }}>
        {/* Cabeçalho */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            paddingBottom: "24px",
            borderBottom: "1px solid #e5e7eb",
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
                  height: "52px",
                  width: "52px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            )}
            <div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#111827",
                  lineHeight: 1.3,
                }}
              >
                {profile.company_name || "Empresa"}
              </p>
              {profile.cpf_cnpj && (
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                  {profile.cpf_cnpj}
                </p>
              )}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: ACCENT,
                letterSpacing: "2px",
              }}
            >
              RECIBO
            </p>
            <p style={{ fontSize: "12px", color: "#6b7280" }}>
              Nº {numeroRecibo(receipt)}
            </p>
          </div>
        </div>

        {/* Valor */}
        <div
          style={{
            background: "linear-gradient(135deg, #eff6ff 0%, #f9fafb 100%)",
            border: "1px solid #dbeafe",
            borderRadius: "10px",
            textAlign: "center",
            padding: "24px",
            margin: "28px 0",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "3px",
              color: "#6b7280",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Valor recebido
          </p>
          <p
            style={{
              fontSize: "34px",
              fontWeight: 800,
              color: "#111827",
              margin: "4px 0",
            }}
          >
            {formatarMoeda(Number(receipt.amount))}
          </p>
          <p style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>
            ({extenso})
          </p>
        </div>

        {/* Declaração */}
        <p style={{ fontSize: "14px", lineHeight: 1.8, textAlign: "justify" }}>
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
          , a importância de{" "}
          <strong>{formatarMoeda(Number(receipt.amount))}</strong> ({extenso}),
          referente a:
        </p>

        {receipt.description && (
          <div
            style={{
              borderLeft: `3px solid ${ACCENT}`,
              backgroundColor: "#f9fafb",
              borderRadius: "0 8px 8px 0",
              padding: "14px 18px",
              margin: "18px 0",
              fontSize: "14px",
            }}
          >
            {receipt.description}
          </div>
        )}

        {receipt.payment_method && (
          <p style={{ fontSize: "13px", marginTop: "16px" }}>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#eff6ff",
                color: ACCENT,
                fontWeight: 600,
                borderRadius: "999px",
                padding: "4px 14px",
              }}
            >
              {receipt.payment_method}
            </span>
          </p>
        )}

        <p style={{ fontSize: "14px", marginTop: "20px", color: "#374151" }}>
          Para maior clareza, firmo o presente recibo para que produza os seus
          efeitos legais.
        </p>

        {/* Rodapé: data e assinatura */}
        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            {profile.city ? `${profile.city}, ` : ""}
            {dataPorExtenso(receipt.receipt_date)}
          </p>

          <div style={{ marginTop: "28px" }}>
            {mostrarAssinatura && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.signature_url!}
                alt="Assinatura"
                crossOrigin="anonymous"
                style={{
                  maxHeight: "70px",
                  maxWidth: "240px",
                  margin: "0 auto",
                  display: "block",
                }}
              />
            )}
            <div
              style={{
                borderTop: "1px solid #111827",
                width: "260px",
                margin: "8px auto 0",
                paddingTop: "8px",
              }}
            >
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                {profile.company_name || "Assinatura"}
              </p>
              {profile.cpf_cnpj && (
                <p style={{ fontSize: "12px", color: "#6b7280" }}>
                  {profile.cpf_cnpj}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
