import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Páginas de login/cadastro: acessíveis só a visitantes (usuário logado é
// redirecionado para o dashboard).
const GUEST_ONLY_ROUTES = ["/login"];

// Sempre acessíveis, estando logado ou não: o fluxo de recuperação de senha
// passa por uma sessão de "recovery" temporária que não deve ser tratada
// como login normal (senão o usuário seria jogado para o dashboard antes de
// conseguir definir a nova senha).
const ALWAYS_ACCESSIBLE_ROUTES = [
  "/esqueci-senha",
  "/redefinir-senha",
  "/auth/callback",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isGuestOnly = GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r));
  const isAlwaysAccessible = ALWAYS_ACCESSIBLE_ROUTES.some((r) =>
    pathname.startsWith(r)
  );

  if (!user && !isGuestOnly && !isAlwaysAccessible) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isGuestOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
