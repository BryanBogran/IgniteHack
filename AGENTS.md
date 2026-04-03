# AGENTS.md

This repo is a production-quality hackathon starter built on Next.js App Router, TypeScript, Supabase SSR auth, Tailwind CSS, and Motion for React.

## Agent Rules

- Prefer the version-matched Next.js docs bundled with the installed `next` package.
- Preserve the App Router architecture. Do not migrate routes to the Pages Router.
- Keep Supabase SSR auth intact. Route protection should remain compatible with middleware and server components.
- Use Tailwind CSS for styling. Do not introduce CSS modules or component libraries.
- Use Motion for React for animation. Keep motion tasteful and lightweight.
- Avoid adding unnecessary dependencies. Prefer small local utilities and composable components.
- Keep components small, readable, and easy to extend.
- Update `README.md` whenever setup steps, architecture, environment variables, or workflow changes.
- Favor fast iteration and demo readiness over enterprise abstraction.
