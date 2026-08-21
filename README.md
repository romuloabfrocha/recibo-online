# Recibo Online

Sistema de emissão de recibos online para qualquer empresa. Crie sua conta, configure os dados da empresa (nome, CPF/CNPJ, cidade e assinatura) e emita recibos numerados com valor por extenso, prontos para imprimir ou compartilhar em PDF pelo WhatsApp.

## Funcionalidades

- Criação de conta (email/senha) — cada conta tem seus próprios dados e recibos
- Configuração da empresa com upload de logo e da imagem da assinatura
- Emissão de recibo: cliente, CPF/CNPJ, valor (com extenso automático), descrição, forma de pagamento, data e opção de mostrar ou não a assinatura
- Numeração automática sequencial por ano (ex: 015/2026)
- Visualização do recibo no layout tradicional, com assinatura
- Imprimir / salvar em PDF e compartilhar o PDF no WhatsApp (no celular abre o menu de compartilhamento com o arquivo anexado)
- Dashboard com total emitido, total do mês e lista de recibos com busca

## Configuração (uma vez só)

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
