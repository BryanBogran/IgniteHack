import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/ui/container";

export default function SignInPage() {
  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-xl">
        <AuthCard
          title="Welcome back"
          description="Sign in to continue editing your project, notes, and demo narrative."
          footer={
            <p className="text-sm text-slate-500">
              New here?{" "}
              <Link className="font-medium text-[var(--accent)]" href="/sign-up">
                Create an account
              </Link>
            </p>
          }
        >
          <AuthForm mode="sign-in" />
        </AuthCard>
      </Container>
    </main>
  );
}
