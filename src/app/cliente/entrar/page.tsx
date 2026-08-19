"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") || "/cliente/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", { email, password, redirect: false });

    setIsSubmitting(false);

    if (result?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push(redirectTo);
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="mb-1 text-lg font-bold text-primary-900">Acompanhar meu caso</h1>
      <p className="mb-6 text-sm text-slate-500">Entre com seu e-mail e senha cadastrados.</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Ainda não tem conta?{" "}
        <Link href="/solicitar" className="font-semibold text-accent-600 underline underline-offset-4">
          Abrir um caso
        </Link>
      </p>
    </Card>
  );
}

export default function ClienteEntrarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-6">
      <Suspense>
        <EntrarForm />
      </Suspense>
    </main>
  );
}
