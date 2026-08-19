"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSignupSchema, ClientSignupInput } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";

interface Props {
  redirectTo: string;
}

export function ClientSignupForm({ redirectTo }: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientSignupInput>({
    resolver: zodResolver(clientSignupSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: ClientSignupInput) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível criar sua conta. Tente novamente.");
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Conta criada, mas não foi possível entrar automaticamente. Faça login.");
      }

      router.push(redirectTo);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Stepper steps={["Dados pessoais", "Seu caso"]} currentStep={1} />

      <Card>
        <h2 className="text-h3 text-foreground">Seus dados</h2>
        <p className="mb-6 mt-1 text-small text-foreground-secondary">
          Precisamos apenas de algumas informações para conectar você a advogados.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 text-label font-medium text-foreground">Informações pessoais</legend>
            <Input
              label="Nome completo"
              placeholder="Seu nome completo"
              error={errors.fullName?.message}
              {...register("fullName")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                error={errors.cpf?.message}
                {...register("cpf")}
              />
              <Input
                label="Data de nascimento"
                type="date"
                error={errors.birthDate?.message}
                {...register("birthDate")}
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 border-t border-border pt-5">
            <legend className="mb-1 text-label font-medium text-foreground">Contato</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="WhatsApp"
                placeholder="(11) 91234-5678"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="voce@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            <Input
              label="Senha"
              type="password"
              hint="Mínimo de 8 caracteres."
              error={errors.password?.message}
              {...register("password")}
            />
          </fieldset>

          {submitError && <p className="text-small font-medium text-destructive">{submitError}</p>}

          <Button type="submit" variant="success" size="lg" isLoading={isSubmitting}>
            Continuar
          </Button>
        </form>
      </Card>
    </div>
  );
}
