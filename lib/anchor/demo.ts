import type { ProfileRow } from "@/types/database";

export const demoProfile: ProfileRow = {
  id: "demo-user",
  email: "demo@project-anchor.local",
  full_name: "Project Anchor Demo",
  avatar_url: null,
  team_name: "Project Anchor",
  created_at: new Date(0).toISOString(),
};
