"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";
import { formatarMoeda } from "@/lib/extenso";
import { numeroRecibo, type Receipt } from "@/lib/types";

export default function DashboardPage() {
  const supabase = createClient();
  const [recibos, setRecibos] = useState<Receipt[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("receipts")
        .select("*")
        .order("created_at", { ascending: false });
      setRecibos((data as Receipt[]) ?? []);
      setCarregando(false);
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agora = new Date();
  const totalGeral = recibos.reduce((s, r) => s + Number(r.amount), 0);
  const doMes = recibos.filter((r) => {
    const d = new Date(r.receipt_date + "T00:00:00");
    return (
      d.getMonth() === agora.getMonth() &&
      d.getFullYear() === agora.getFullYear()
    );
  });
  const totalMes = doMes.reduce((s, r) => s + Number(r.amount), 0);

  const filtrados = busca.trim()
    ? recibos.filter(
        (r) =>
          r.client_name.toLowerCase().includes(busca.toLowerCase()) ||
          numeroRecibo(r).includes(busca) ||
          (r.description ?? "").toLowerCase().includes(busca.toLowerCase())
      )
    : recibos;

  async function excluir(id: string) {
    if (!confirm("Excluir este recibo? Essa ação não pode ser desfeita.")) return;
    await supabase.from("receipts").delete().eq("id", id);
    setRecibos((rs) => rs.filter((r) => r.id !== id));
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <Link
            href="/novo-recibo"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            + Novo Recibo
          </Link>
        </div>

        {/* Cards de totais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Total emitido</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatarMoeda(totalGeral)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Total no mês</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatarMoeda(totalMes)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {doMes.length} recibo(s) este mês
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Recibos emitidos</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {recibos.length}
            </p>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente, número ou descrição..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {carregando ? (
            <p className="p-6 text-sm text-gray-500 text-center">
              Carregando...
            </p>
          ) : filtrados.length === 0 ? (
            <p className="p-6 text-sm text-gray-500 text-center">
              {recibos.length === 0
                ? "Nenhum recibo emitido ainda. Clique em “Novo Recibo” para começar."
                : "Nenhum recibo encontrado para essa busca."}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtrados.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <Link href={`/recibo/${r.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Recibo #{numeroRecibo(r)} — {r.client_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(
                        r.receipt_date + "T00:00:00"
                      ).toLocaleDateString("pt-BR")}
                      {r.description ? ` · ${r.description}` : ""}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatarMoeda(Number(r.amount))}
                    </span>
                    <button
                      onClick={() => excluir(r.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                      title="Excluir recibo"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
