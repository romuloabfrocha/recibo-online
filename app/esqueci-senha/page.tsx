"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });

    setEnviando(false);
    if (error) {
      setErro(`Não foi possível enviar o email: ${error.message}`);
      return;
    }
    setEnviado(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Recuperar senha
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Informe seu email para receber o link de redefinição
        </p>

        {enviado ? (
          <p className="text-sm text-green-700 text-center">
            Se existir uma conta com esse email, enviamos um link para
            redefinir a senha. Verifique sua caixa de entrada (e o spam).
          </p>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm"
            >
              {enviando ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="block text-center text-sm text-blue-600 hover:underline mt-4"
        >
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
