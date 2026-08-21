# Recibo Online

Sistema completo de emissão de recibos para qualquer empresa: cadastro de conta multi-empresa, geração de recibos numerados com valor por extenso, personalização com logo e assinatura, compartilhamento em PDF pelo WhatsApp e um dashboard com o total emitido.

**🔗 Demo ao vivo:** [recibo-online-gratis.vercel.app](https://recibo-online-gratis.vercel.app)

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** — autenticação, banco Postgres com Row Level Security e storage de arquivos
- **jsPDF** + **html2canvas-pro** — geração de PDF no navegador
- **Vitest** + **Testing Library** — testes automatizados

## Screenshots

> _Espaço reservado — adicione aqui prints do dashboard, do formulário de novo recibo e do recibo final gerado._

| Dashboard | Recibo gerado |
|---|---|
| _(screenshot)_ | _(screenshot)_ |

## Funcionalidades

- Criação de conta (email/senha) com recuperação de senha por email — cada conta tem seus próprios dados e recibos, isolados por Row Level Security
- Configuração da empresa com upload de logo e da imagem da assinatura
- Emissão de recibo: cliente, CPF/CNPJ, valor (com extenso automático em português), descrição, forma de pagamento, data e opção de mostrar ou não a assinatura
- Numeração automática sequencial por ano (ex: 015/2026)
- Recibo com layout próprio, pronto para imprimir/salvar em PDF ou compartilhar via WhatsApp (Web Share API no celular)
- Dashboard com total emitido, total do mês e lista de recibos com busca

## Destaques técnicos

- Autenticação e sessão via `@supabase/ssr`, com middleware protegendo as rotas autenticadas
- Isolamento de dados entre contas garantido por políticas de Row Level Security no Postgres (não apenas na aplicação)
- Geração de PDF client-side (sem servidor) capturando o recibo renderizado e convertendo em arquivo compartilhável
- Conversor de valor numérico para texto por extenso em português, escrito do zero e coberto por testes
- Suíte de testes automatizados (Vitest) cobrindo regras de negócio, renderização de componentes e o fluxo de geração/compartilhamento do PDF

---

## Rodando o projeto localmente

### 1. Supabase (banco de dados e login — gratuito)

1. Acesse [supabase.com](https://supabase.com), crie uma conta e um novo projeto.
2. No menu lateral, abra **SQL Editor**, cole todo o conteúdo de [supabase/schema.sql](supabase/schema.sql) e clique em **Run**.
3. (Opcional, recomendado para simplificar) Em **Authentication → Sign In / Up → Email**, desative **Confirm email** para que as contas entrem direto sem confirmação por email.
4. Em **Settings → API**, copie a **Project URL** e a chave **anon public**.
5. Em **Authentication → URL Configuration**, adicione a URL do seu site em **Redirect URLs** (ex: `http://localhost:3000/auth/callback` para testar localmente e `https://SEU-SITE.vercel.app/auth/callback` depois de publicar). Isso é necessário para o fluxo de **"Esqueci minha senha"** funcionar — sem essa URL cadastrada, o Supabase recusa o redirecionamento do link enviado por email.

### 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA-CHAVE-ANON
```

### 3. Rodar localmente

```
npm install
npm run dev
```

Abra http://localhost:3000

### 4. Testes automatizados

```
npm run test
```

Cobre as regras de negócio (valor por extenso, formatação de moeda/data, numeração dos recibos), a renderização do recibo (logo, assinatura opcional) e a geração/compartilhamento do PDF.

### Já tinha um projeto criado antes de logo/assinatura opcional existirem?

Rode apenas este trecho no SQL Editor do Supabase (o `schema.sql` já está atualizado, mas ele não roda migrações em bancos existentes automaticamente):

```sql
alter table public.profiles add column if not exists logo_url text;
alter table public.receipts add column if not exists show_signature boolean not null default true;
```

## Publicar no Vercel

1. Suba o projeto para um repositório no GitHub.
2. Acesse [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os mesmos valores do `.env.local`.
4. Clique em **Deploy**. Pronto — o site fica no ar com um link `*.vercel.app`.

Alternativa sem GitHub: instale a CLI (`npm i -g vercel`) e rode `vercel` na pasta do projeto.
