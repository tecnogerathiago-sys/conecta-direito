"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeadSchema, CreateLeadInput } from "@/lib/validations";
import { StepCaseDetails } from "@/components/forms/steps/StepCaseDetails";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function LeadCaptureForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    mode: "onBlur",
  });

  async function onSubmit(data: CreateLeadInput) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível enviar seu pedido. Tente novamente.");
      }

      router.push("/obrigado");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <h2 className="mb-1 text-lg font-bold text-primary-900">Sobre o seu caso</h2>
      <p className="mb-6 text-sm text-slate-500">
        Quanto mais detalhes, melhor a análise do seu caso pelos advogados.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <StepCaseDetails register={register} errors={errors} />

        {submitError && <p className="text-sm font-medium text-red-500">{submitError}</p>}

        <Button type="submit" variant="success" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar meu caso"}
        </Button>
      </form>
    </Card>
  );
}
