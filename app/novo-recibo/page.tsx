"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";

const FORMAS_PAGAMENTO = [
  "PIX",
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência Bancária",
  "Boleto",
  "Cheque",
];

function hoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NovoReciboPage() {
  const router = useRouter();
  const supabase = createClient();

  const [clientName, setClientName] = useState("");
  const [clientDoc, setClientDoc] = useState("");
  const [valorCentavos, setValorCentavos] = useState(0);
  const [descricao, setDescricao] = useState("");
  const [pagamento, setPagamento] = useState("PIX");
  const [data, setData] = useState(hoje());
  const [mostrarAssinatura, setMostrarAssinatura] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const valorFormatado = (valorCentavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  function aoDigitarValor(e: React.ChangeEvent<HTMLInputElement>) {
    const digitos = e.target.value.replace(/\D/g, "");
    setValorCentavos(digitos ? parseInt(digitos, 10) : 0);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (valorCentavos <= 0) {
      setErro("Informe o valor do recibo.");
      return;
    }
    setSalvando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const ano = new Date(data + "T00:00:00").getFullYear();

    // Próximo número sequencial do ano
    const { data: ultimo } = await supabase
      .from("receipts")
      .select("number")
      .eq("year", ano)
      .order("number", { ascending: false })
      .limit(1);
    const proximoNumero = (ultimo?.[0]?.number ?? 0) + 1;

    const { data: criado, error } = await supabase
      .from("receipts")
      .insert({
        user_id: user.id,
        number: proximoNumero,
        year: ano,
        client_name: clientName.trim(),
        client_cpf_cnpj: clientDoc.trim() || null,
        amount: valorCentavos / 100,
        description: descricao.trim() || null,
        payment_method: pagamento,
        receipt_date: data,
        show_signature: mostrarAssinatura,
      })
      .select("id")
      .single();

    if (error || !criado) {
      setErro(`Erro ao salvar o recibo: ${error?.message ?? "desconhecido"}`);
      setSalvando(false);
      return;
    }

    router.push(`/recibo/${criado.id}`);
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-bold text-gray-900 mt-2 mb-4">
          Novo Recibo
        </h1>

        <form
          onSubmit={salvar}
          className="bg-white rounded-xl shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do cliente (pagador) *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome completo do cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF/CNPJ do cliente
            </label>
            <input
              type="text"
              value={clientDoc}
              onChange={(e) => setClientDoc(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Opcional"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor *
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={valorCentavos ? valorFormatado : ""}
                onChange={aoDigitarValor}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data do recibo *
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referente a (descrição do serviço/produto)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Serviço prestado / produto vendido"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Forma de pagamento
            </label>
            <select
              value={pagamento}
              onChange={(e) => setPagamento(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FORMAS_PAGAMENTO.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={mostrarAssinatura}
              onChange={(e) => setMostrarAssinatura(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mostrar assinatura neste recibo
          </label>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm"
          >
            {salvando ? "Salvando..." : "Gerar Recibo"}
          </button>
        </form>
      </main>
    </div>
  );
}
