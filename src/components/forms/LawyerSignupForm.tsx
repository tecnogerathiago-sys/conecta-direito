"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LegalArea } from "@prisma/client";
import { lawyerSignupSchema, LawyerSignupInput } from "@/lib/validations";
import { LEGAL_AREA_LABELS, BRAZILIAN_STATES } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Props {
  redirectTo: string;
}

export function LawyerSignupForm({ redirectTo }: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LawyerSignupInput>({
    resolver: zodResolver(lawyerSignupSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: LawyerSignupInput) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/lawyers", {
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
    <Card className="mx-auto w-full max-w-xl">
      <h2 className="text-h3 text-foreground">Cadastro de advogado</h2>
      <p className="mb-6 mt-1 text-small text-foreground-secondary">
        Crie sua conta para acessar o mural de causas e assinar um plano.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-label font-medium text-foreground">Dados pessoais</legend>
          <Input
            label="Nome completo"
            placeholder="Seu nome completo"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
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

        <fieldset className="flex flex-col gap-4 border-t border-border pt-5">
          <legend className="mb-1 text-label font-medium text-foreground">Registro na OAB</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Input
                label="Número da OAB"
                placeholder="123456"
                error={errors.oabNumber?.message}
                {...register("oabNumber")}
              />
            </div>
            <Select label="UF" error={errors.oabState?.message} {...register("oabState")}>
              <option value="">UF</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Cidade / região de atuação"
            placeholder="Ex: São Paulo/SP"
            error={errors.activeRegion?.message}
            {...register("activeRegion")}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-3 border-t border-border pt-5">
          <legend className="mb-1 text-label font-medium text-foreground">Áreas de atuação</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {Object.values(LegalArea).map((area) => (
              <label
                key={area}
                className="flex items-center gap-2 rounded-md border border-border-strong px-3 py-2 text-small text-foreground transition-colors duration-150 hover:bg-background-secondary has-[:checked]:border-primary has-[:checked]:bg-primary-subtle"
              >
                <input
                  type="checkbox"
                  value={area}
                  className="size-4 rounded border-border-strong text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  {...register("areasOfPractice")}
                />
                {LEGAL_AREA_LABELS[area]}
              </label>
            ))}
          </div>
          {errors.areasOfPractice?.message && (
            <span className="text-small text-destructive">{errors.areasOfPractice.message}</span>
          )}
        </fieldset>

        {submitError && <p className="text-small font-medium text-destructive">{submitError}</p>}

        <Button type="submit" variant="success" size="lg" isLoading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </Card>
  );
}
