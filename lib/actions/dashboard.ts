"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";

async function getCurrentUserId() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  return { supabase, userId: user.id, email: user.email ?? "" };
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, userId, email } = await getCurrentUserId();

  const full_name = String(formData.get("full_name") || "").trim();
  const team_name = String(formData.get("team_name") || "").trim();
  const avatar_url = String(formData.get("avatar_url") || "").trim();

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name,
    team_name,
    avatar_url,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function saveProjectAction(formData: FormData) {
  const { supabase, userId } = await getCurrentUserId();

  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const industry = String(formData.get("industry") || "").trim();
  const stage = String(formData.get("stage") || "").trim();

  if (!title || !summary) {
    throw new Error("Title and summary are required.");
  }

  const { data: existingProject } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  const payload = {
    owner_id: userId,
    title,
    summary,
    industry,
    stage,
  };

  const query = existingProject
    ? supabase.from("projects").update(payload).eq("id", existingProject.id)
    : supabase.from("projects").insert(payload);

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function addNoteAction(projectId: string | null, formData: FormData) {
  if (!projectId) {
    throw new Error("Create a project before adding notes.");
  }

  const { supabase, userId } = await getCurrentUserId();
  const content = String(formData.get("content") || "").trim();

  if (!content) {
    throw new Error("Note content is required.");
  }

  const { error } = await supabase.from("notes").insert({
    project_id: projectId,
    author_id: userId,
    content,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}
