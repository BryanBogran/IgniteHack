import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/ui/container";

export default function SignUpPage() {
  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-xl">
        <AuthCard
          title="Create your workspace"
          description="Set up a team-ready starter with project notes, structured sections, and a protected dashboard."
          footer={
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link className="font-medium text-[var(--accent)]" href="/sign-in">
                Sign in
              </Link>
            </p>
          }
        >
          <AuthForm mode="sign-up" />
        </AuthCard>
      </Container>
    </main>
  );
}
