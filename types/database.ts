export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  team_name: string | null;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  owner_id: string;
  title: string;
  summary: string;
  industry: string | null;
  stage: string | null;
  created_at: string;
};

export type NoteRow = {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  created_at: string;
};
