-- =============================================================
-- RECIBO ONLINE — Execute este script no SQL Editor do Supabase
-- (supabase.com → seu projeto → SQL Editor → colar → Run)
-- =============================================================

-- Perfil da empresa (1 por conta)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text,
  cpf_cnpj text,
  city text,
  signature_url text,
  logo_url text,
  created_at timestamptz default now()
);

alter table public.profiles add column if not exists logo_url text;

alter table public.profiles enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

grant select, insert, update, delete on public.profiles to authenticated;

-- Recibos
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number int not null,
  year int not null,
  client_name text not null,
  client_cpf_cnpj text,
  amount numeric(12,2) not null,
  description text,
  payment_method text,
  receipt_date date not null default current_date,
  show_signature boolean not null default true,
  created_at timestamptz default now()
);

alter table public.receipts add column if not exists show_signature boolean not null default true;

alter table public.receipts enable row level security;

drop policy if exists "own receipts" on public.receipts;
create policy "own receipts" on public.receipts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.receipts to authenticated;

create index if not exists receipts_user_year_idx
  on public.receipts (user_id, year, number desc);

-- Bucket público para as imagens de assinatura e logo da empresa
-- (arquivos ficam em pastas por usuário: {user_id}/assinatura.ext e {user_id}/logo.ext)
insert into storage.buckets (id, name, public)
  values ('signatures', 'signatures', true)
  on conflict (id) do nothing;

drop policy if exists "signatures read" on storage.objects;
create policy "signatures read" on storage.objects
  for select using (bucket_id = 'signatures');

drop policy if exists "signatures insert" on storage.objects;
create policy "signatures insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'signatures' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "signatures update" on storage.objects;
create policy "signatures update" on storage.objects
  for update to authenticated
  using (bucket_id = 'signatures' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "signatures delete" on storage.objects;
create policy "signatures delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'signatures' and (storage.foldername(name))[1] = auth.uid()::text);
