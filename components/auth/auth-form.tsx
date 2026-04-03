"use client";

import { useActionState } from "react";
import { authenticateWithPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
  error: "",
  success: "",
};

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const action = authenticateWithPassword.bind(null, mode);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form className="space-y-5" action={formAction}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="team@demo.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          placeholder="••••••••"
          minLength={8}
          required
        />
      </div>
      {mode === "sign-up" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" placeholder="Avery Chen" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team_name">Team name</Label>
            <Input id="team_name" name="team_name" placeholder="Northstar Strategy" />
          </div>
        </>
      ) : null}

      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}

      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
