"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAviso("");
    setCarregando(true);

    if (modo === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) {
        setErro("Email ou senha incorretos.");
        setCarregando(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });
      if (error) {
        setErro(
          error.message.includes("already registered")
            ? "Este email já possui uma conta."
            : `Erro ao criar conta: ${error.message}`
        );
        setCarregando(false);
        return;
      }
      if (data.session) {
        router.push("/configuracoes");
        router.refresh();
      } else {
        setAviso(
          "Conta criada! Verifique seu email para confirmar o cadastro e depois faça login."
        );
        setModo("login");
        setCarregando(false);
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Recibo Online
        </h1>
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          {modo === "login"
            ? "Entre na sua conta"
            : "Crie sua conta gratuitamente"}
        </p>

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
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

          {modo === "login" && (
            <Link
              href="/esqueci-senha"
              className="block text-right text-sm text-blue-600 hover:underline"
            >
              Esqueci minha senha
            </Link>
          )}

          {erro && <p className="text-sm text-red-600">{erro}</p>}
          {aviso && <p className="text-sm text-green-700">{aviso}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm"
          >
            {carregando
              ? "Aguarde..."
              : modo === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => {
            setModo(modo === "login" ? "cadastro" : "login");
            setErro("");
            setAviso("");
          }}
          className="w-full text-sm text-blue-600 hover:underline mt-4"
        >
          {modo === "login"
            ? "Não tem conta? Criar conta"
            : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}
