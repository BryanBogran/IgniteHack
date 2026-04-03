-- Optional demo seed. Run after creating a real auth user.
-- Replace the UUID below with a real auth.users id from your Supabase project.

insert into public.profiles (id, email, full_name, team_name)
values (
  '00000000-0000-0000-0000-000000000000',
  'demo@example.com',
  'Demo User',
  'Northstar Strategy'
)
on conflict (id) do nothing;

insert into public.projects (owner_id, title, summary, industry, stage)
values (
  '00000000-0000-0000-0000-000000000000',
  'Northstar Health',
  'AI-assisted care navigation for underinsured patients, with a focus on reducing drop-off before specialty appointments.',
  'Healthcare',
  'Pilot ready'
);
