"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLeadSchema,
  CreateLeadInput,
  stepPersonalDataSchema,
  stepCaseDetailsSchema,
} from "@/lib/validations";
import { StepPersonalData } from "@/components/forms/steps/StepPersonalData";
import { StepCaseDetails } from "@/components/forms/steps/StepCaseDetails";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const STEP_FIELDS: (keyof CreateLeadInput)[][] = [
  Object.keys(stepPersonalDataSchema.shape) as (keyof CreateLeadInput)[],
  Object.keys(stepCaseDetailsSchema.shape) as (keyof CreateLeadInput)[],
];

const TOTAL_STEPS = STEP_FIELDS.length;

export function LeadCaptureForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    mode: "onBlur",
  });

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

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
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-success" : "bg-primary-50"}`}
          />
        ))}
      </div>

      <h2 className="mb-1 text-lg font-bold text-primary-900">
        {step === 0 ? "Seus dados" : "Sobre o seu caso"}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        {step === 0
          ? "Passo 1 de 2 — usamos isso apenas para o advogado entrar em contato."
          : "Passo 2 de 2 — quanto mais detalhes, melhor a análise do seu caso."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {step === 0 && <StepPersonalData register={register} errors={errors} />}
        {step === 1 && <StepCaseDetails register={register} errors={errors} />}

        {submitError && <p className="text-sm font-medium text-red-500">{submitError}</p>}

        <div className="flex justify-between gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={goBack} disabled={isSubmitting}>
              Voltar
            </Button>
          ) : (
            <span />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <Button type="button" variant="primary" onClick={goNext}>
              Próximo
            </Button>
          ) : (
            <Button type="submit" variant="success" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar meu caso"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
