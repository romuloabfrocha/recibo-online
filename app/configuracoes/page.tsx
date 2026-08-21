"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

async function enviarImagem(
  supabase: SupabaseClient,
  userId: string,
  arquivo: File,
  nomeBase: "logo" | "assinatura"
): Promise<string> {
  const ext = arquivo.name.split(".").pop()?.toLowerCase() ?? "png";
  const caminho = `${userId}/${nomeBase}.${ext}`;
  const { error } = await supabase.storage
    .from("signatures")
    .upload(caminho, arquivo, { upsert: true });
  if (error) throw error;
  const { data: pub } = supabase.storage.from("signatures").getPublicUrl(caminho);
  // Adiciona timestamp para evitar cache da imagem antiga
  return `${pub.publicUrl}?v=${Date.now()}`;
}

export default function ConfiguracoesPage() {
  const supabase = createClient();

  const [userId, setUserId] = useState("");
  const [nome, setNome] = useState("");
  const [doc, setDoc] = useState("");
  const [cidade, setCidade] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoArquivo, setLogoArquivo] = useState<File | null>(null);
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | null>(null);
  const [assinaturaArquivo, setAssinaturaArquivo] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null
  );

  useEffect(() => {
    async function carregar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (p) {
        setNome(p.company_name ?? "");
        setDoc(p.cpf_cnpj ?? "");
        setCidade(p.city ?? "");
        setLogoUrl(p.logo_url);
        setAssinaturaUrl(p.signature_url);
      }
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSalvando(true);

    try {
      const novoLogoUrl = logoArquivo
        ? await enviarImagem(supabase, userId, logoArquivo, "logo")
        : logoUrl;
      const novaAssinaturaUrl = assinaturaArquivo
        ? await enviarImagem(supabase, userId, assinaturaArquivo, "assinatura")
        : assinaturaUrl;

      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        company_name: nome.trim() || null,
        cpf_cnpj: doc.trim() || null,
        city: cidade.trim() || null,
        logo_url: novoLogoUrl,
        signature_url: novaAssinaturaUrl,
      });
      if (error) throw error;

      setLogoUrl(novoLogoUrl);
      setLogoArquivo(null);
      setAssinaturaUrl(novaAssinaturaUrl);
      setAssinaturaArquivo(null);
      setMsg({ tipo: "ok", texto: "Dados salvos com sucesso!" });
    } catch (err) {
      setMsg({
        tipo: "erro",
        texto: `Erro ao salvar: ${(err as Error).message}`,
      });
    }
    setSalvando(false);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-bold text-gray-900 mt-2 mb-1">
          Configurações da Empresa
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Esses dados aparecem em todos os recibos emitidos.
        </p>

        <form
          onSubmit={salvar}
          className="bg-white rounded-xl shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da empresa ou responsável (quem assina o recibo) *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome completo ou razão social"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ
              </label>
              <input
                type="text"
                value={doc}
                onChange={(e) => setDoc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade - UF
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cidade - UF"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo da empresa
            </label>
            {logoUrl && !logoArquivo && (
              <div className="border border-gray-200 rounded-lg p-3 mb-2 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo atual" className="max-h-16 mx-auto" />
                <p className="text-xs text-gray-500 text-center mt-1">
                  Logo atual
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setLogoArquivo(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400 mt-1">
              Opcional. Aparece ao lado do nome da empresa no recibo.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assinatura (imagem)
            </label>
            {assinaturaUrl && !assinaturaArquivo && (
              <div className="border border-gray-200 rounded-lg p-3 mb-2 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assinaturaUrl}
                  alt="Assinatura atual"
                  className="max-h-20 mx-auto"
                />
                <p className="text-xs text-gray-500 text-center mt-1">
                  Assinatura atual
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setAssinaturaArquivo(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-400 mt-1">
              Dica: foto da assinatura em fundo branco ou imagem PNG com fundo
              transparente. Você pode escolher, ao emitir cada recibo, se ela
              deve aparecer ou não.
            </p>
          </div>

          {msg && (
            <p
              className={`text-sm ${msg.tipo === "ok" ? "text-green-700" : "text-red-600"}`}
            >
              {msg.texto}
            </p>
          )}

          <button
            type="submit"
            disabled={salvando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </main>
    </div>
  );
}
