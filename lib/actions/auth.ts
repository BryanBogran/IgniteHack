"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

type ActionState = {
  error: string;
  success: string;
};

export async function authenticateWithPassword(
  mode: "sign-in" | "sign-up",
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required.", success: "" };
  }

  const supabase = await createServerClient();

  if (mode === "sign-up") {
    const fullName = String(formData.get("full_name") || "").trim();
    const teamName = String(formData.get("team_name") || "").trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          team_name: teamName,
        },
      },
    });

    if (error) {
      return { error: error.message, success: "" };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, success: "" };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
