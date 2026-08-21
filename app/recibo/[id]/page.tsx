"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ReceiptView from "@/components/ReceiptView";
import { createClient } from "@/lib/supabase/client";
import { compartilharOuBaixarPdf } from "@/lib/pdf";
import { numeroRecibo, type Profile, type Receipt } from "@/lib/types";

export default function ReciboPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [recibo, setRecibo] = useState<Receipt | null>(null);
  const [perfil, setPerfil] = useState<Profile | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    async function carregar() {
      const [{ data: r }, { data: userData }] = await Promise.all([
        supabase.from("receipts").select("*").eq("id", id).single(),
        supabase.auth.getUser(),
      ]);
      if (!r) {
        router.push("/dashboard");
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user!.id)
        .single();
      setRecibo(r as Receipt);
      setPerfil(
        (p as Profile) ?? {
          id: userData.user!.id,
          company_name: null,
          cpf_cnpj: null,
          city: null,
          signature_url: null,
          logo_url: null,
        }
      );
      setCarregando(false);
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function compartilhar() {
    if (!recibo) return;
    setGerando(true);
    setAviso("");
    try {
      const nome = `recibo-${String(recibo.number).padStart(3, "0")}-${recibo.year}.pdf`;
      const resultado = await compartilharOuBaixarPdf(
        nome,
        `Recibo #${numeroRecibo(recibo)}`
      );
      if (resultado === "baixado") {
        setAviso(
          "PDF baixado! No computador, anexe o arquivo manualmente na conversa do WhatsApp."
        );
      }
    } catch {
      setAviso("Não foi possível gerar o PDF. Tente novamente.");
    }
    setGerando(false);
  }

  if (carregando || !recibo || !perfil) {
    return (
      <div className="min-h-screen">
        <Header />
        <p className="p-8 text-sm text-gray-500 text-center">Carregando...</p>
      </div>
    );
  }

  const perfilIncompleto = !perfil.company_name;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto p-4">
        <div className="no-print flex flex-wrap items-center justify-between gap-3 mt-2 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Recibo #{numeroRecibo(recibo)}
            </h1>
            <p className="text-xs text-gray-500">
              Visualização do recibo gerado
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg"
            >
              🖨️ Imprimir / PDF
            </button>
            <button
              onClick={compartilhar}
              disabled={gerando}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              {gerando ? "Gerando PDF..." : "📄 Compartilhar no WhatsApp"}
            </button>
          </div>
        </div>

        {perfilIncompleto && (
          <div className="no-print bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg p-3 mb-4">
            Os dados da sua empresa ainda não foram preenchidos.{" "}
            <Link href="/configuracoes" className="underline font-medium">
              Preencha nas Configurações
            </Link>{" "}
            para que apareçam no recibo.
          </div>
        )}

        {aviso && (
          <div className="no-print bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg p-3 mb-4">
            {aviso}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <ReceiptView receipt={recibo} profile={perfil} />
        </div>
      </main>
    </div>
  );
}
