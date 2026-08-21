"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/novo-recibo", label: "Novo Recibo" },
  { href: "/configuracoes", label: "Configurações" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="no-print bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-gray-900">
          Recibo Online
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                pathname.startsWith(l.href)
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={sair}
            className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
