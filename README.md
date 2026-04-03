# Hackathon Starter

Production-quality starter for hackathons, case competitions, and pitch demos using Next.js App Router, TypeScript, Supabase SSR auth, Tailwind CSS, and Motion for React.

## Stack

- Next.js App Router with TypeScript
- Supabase for auth and Postgres
- Tailwind CSS for styling
- Motion for React for transitions and interaction polish
- ESLint and strict TypeScript for fast iteration with guardrails

## What You Get

- Responsive landing page with a polished marketing feel
- Supabase email/password auth
- Protected dashboard route with session-aware navbar
- Minimal project/profile/notes data model with RLS
- Reusable UI components for buttons, cards, inputs, empty states, modal, and layout
- Dashboard sections tailored for case competition workflows
- Clear setup docs and environment template

## Project Structure

```text
app/
components/
lib/
supabase/
types/
public/
```

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:

- `SUPABASE_SERVICE_ROLE_KEY`
  Only for future server-side admin scripts. This starter does not use it by default.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Add your Supabase project URL and anon key to `.env.local`.

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Supabase Setup

1. Create a new Supabase project.
2. In Supabase, enable Email auth under `Authentication -> Providers`.
3. Copy the project URL and anon key into `.env.local`.
4. Open the SQL editor and run the migration in [supabase/migrations/202603271300_initial_schema.sql](/Users/chase/code/cosc-3380/group-project/webapp/hackmisso-26/supabase/migrations/202603271300_initial_schema.sql).
5. Optional: update the UUID in [supabase/seed.sql](/Users/chase/code/cosc-3380/group-project/webapp/hackmisso-26/supabase/seed.sql) and run it for demo data.

## Auth Architecture

- Middleware refreshes the Supabase session and protects `/dashboard`.
- Server components use SSR-compatible Supabase clients.
- Auth forms use server actions for sign-in, sign-up, and sign-out.
- A trigger creates or updates `profiles` records when new auth users are created.

## Database Schema

Tables:

- `profiles`
- `projects`
- `notes`

Security:

- Profiles are only visible and editable by the owning user.
- Projects are only accessible to their owner.
- Notes are scoped to the author and the owner of the related project.

## Deployment Notes

- Works on Vercel with environment variables set in the project settings.
- Run the same SQL migration against the production Supabase project before launch.
- Keep the anon key in client-facing env vars only. Do not expose the service role key to the browser.

## What To Customize First

1. Replace the landing page copy and brand styling.
2. Adjust the `projects` schema to match your competition or demo workflow.
3. Add your real dashboard sections, metrics, and project narrative blocks.
4. Decide whether to add Supabase Storage uploads or a public share page.

## Manual SQL To Run

Run:

- [supabase/migrations/202603271300_initial_schema.sql](/Users/chase/code/cosc-3380/group-project/webapp/hackmisso-26/supabase/migrations/202603271300_initial_schema.sql)

Optional:

- [supabase/seed.sql](/Users/chase/code/cosc-3380/group-project/webapp/hackmisso-26/supabase/seed.sql)

## Commands

Install:

```bash
npm install
```

Develop:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## Optional Next Enhancements

- Dark mode toggle
- Supabase Storage file uploads for pitch assets
- Toast notifications for form success and error states
- Public read-only share page for project demos
- Demo data generator for onboarding judges quickly
# IgniteHack
