create table if not exists public.boards (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  data jsonb not null,
  created_at timestamptz default now() not null
);

alter table public.boards enable row level security;

create policy "boards_select" on public.boards
  for select using (true);

create policy "boards_insert" on public.boards
  for insert with check (true);

create policy "boards_delete" on public.boards
  for delete using (true);
