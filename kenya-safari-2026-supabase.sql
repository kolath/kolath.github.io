create table if not exists public.safari_checklist_state (
  page_slug text primary key,
  checked_ids jsonb not null default '[]'::jsonb,
  custom_items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_safari_checklist_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists safari_checklist_state_touch_updated_at on public.safari_checklist_state;
create trigger safari_checklist_state_touch_updated_at
before update on public.safari_checklist_state
for each row
execute function public.touch_safari_checklist_state_updated_at();

alter table public.safari_checklist_state enable row level security;

drop policy if exists "public read safari checklist state" on public.safari_checklist_state;
create policy "public read safari checklist state"
on public.safari_checklist_state
for select
to anon
using (page_slug = 'kenya-safari-2026');

drop policy if exists "public insert safari checklist state" on public.safari_checklist_state;
create policy "public insert safari checklist state"
on public.safari_checklist_state
for insert
to anon
with check (page_slug = 'kenya-safari-2026');

drop policy if exists "public update safari checklist state" on public.safari_checklist_state;
create policy "public update safari checklist state"
on public.safari_checklist_state
for update
to anon
using (page_slug = 'kenya-safari-2026')
with check (page_slug = 'kenya-safari-2026');
