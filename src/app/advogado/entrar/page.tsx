"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scale } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/advogado/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <span className="mb-4 flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Scale className="size-5" aria-hidden />
        </span>
        <h1 className="text-h3 text-foreground">Painel do advogado</h1>
        <p className="mb-6 mt-1 text-small text-foreground-secondary">
          Entre com seu e-mail e senha cadastrados.
        </p>

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
          {error && <p className="text-small font-medium text-destructive">{error}</p>}
          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
}
