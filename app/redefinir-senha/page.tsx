"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { validarNovaSenha } from "@/lib/validacaoSenha";

export default function RedefinirSenhaPage() {
  const supabase = createClient();
  const router = useRouter();

  const [checando, setChecando] = useState(true);
  const [sessaoValida, setSessaoValida] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSessaoValida(!!data.user);
      setChecando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    const erroValidacao = validarNovaSenha(senha, confirmarSenha);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);

    if (error) {
      setErro(`Erro ao redefinir senha: ${error.message}`);
      return;
    }

    setSucesso(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  if (checando) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Carregando...</p>
      </main>
    );
  }

  if (!sessaoValida) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Link inválido ou expirado
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            Solicite um novo link de redefinição de senha.
          </p>
          <Link
            href="/esqueci-senha"
            className="text-sm text-blue-600 hover:underline"
          >
            Solicitar novo link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Nova senha
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Escolha uma nova senha para sua conta
        </p>

        {sucesso ? (
          <p className="text-sm text-green-700 text-center">
            Senha atualizada! Redirecionando...
          </p>
        ) : (
          <form onSubmit={salvar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nova senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {erro && <p className="text-sm text-red-600">{erro}</p>}

            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm"
            >
              {salvando ? "Salvando..." : "Redefinir senha"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
