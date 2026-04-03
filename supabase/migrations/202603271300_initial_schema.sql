create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  team_name text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  summary text not null,
  industry text,
  stage text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0),
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.notes enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, team_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'team_name'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    team_name = coalesce(excluded.team_name, public.profiles.team_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop policy if exists "profiles are viewable by owner" on public.profiles;
create policy "profiles are viewable by owner"
  on public.profiles
  for select
  using ((select auth.uid()) = id);

drop policy if exists "profiles are insertable by owner" on public.profiles;
create policy "profiles are insertable by owner"
  on public.profiles
  for insert
  with check ((select auth.uid()) = id);

drop policy if exists "profiles are updatable by owner" on public.profiles;
create policy "profiles are updatable by owner"
  on public.profiles
  for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "projects are viewable by owner" on public.projects;
create policy "projects are viewable by owner"
  on public.projects
  for select
  using ((select auth.uid()) = owner_id);

drop policy if exists "projects are insertable by owner" on public.projects;
create policy "projects are insertable by owner"
  on public.projects
  for insert
  with check ((select auth.uid()) = owner_id);

drop policy if exists "projects are updatable by owner" on public.projects;
create policy "projects are updatable by owner"
  on public.projects
  for update
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "projects are deletable by owner" on public.projects;
create policy "projects are deletable by owner"
  on public.projects
  for delete
  using ((select auth.uid()) = owner_id);

drop policy if exists "notes are viewable by owner" on public.notes;
create policy "notes are viewable by owner"
  on public.notes
  for select
  using (
    (select auth.uid()) = author_id
    or exists (
      select 1 from public.projects
      where public.projects.id = public.notes.project_id
      and public.projects.owner_id = (select auth.uid())
    )
  );

drop policy if exists "notes are insertable by author" on public.notes;
create policy "notes are insertable by author"
  on public.notes
  for insert
  with check (
    (select auth.uid()) = author_id
    and exists (
      select 1 from public.projects
      where public.projects.id = public.notes.project_id
      and public.projects.owner_id = (select auth.uid())
    )
  );

drop policy if exists "notes are updatable by author" on public.notes;
create policy "notes are updatable by author"
  on public.notes
  for update
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

drop policy if exists "notes are deletable by author" on public.notes;
create policy "notes are deletable by author"
  on public.notes
  for delete
  using ((select auth.uid()) = author_id);

comment on table public.profiles is 'User profiles for case competition teams.';
comment on table public.projects is 'Project records owned by a single authenticated user.';
comment on table public.notes is 'Internal project notes scoped to project owners and note authors.';
