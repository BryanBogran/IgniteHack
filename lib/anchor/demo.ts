import type { ProfileRow } from "@/types/database";

export const demoProfile: ProfileRow = {
  id: "demo-user",
  email: "demo@memento.local",
  full_name: "Memento Demo",
  avatar_url: null,
  team_name: "Memento",
  created_at: new Date(0).toISOString(),
};
