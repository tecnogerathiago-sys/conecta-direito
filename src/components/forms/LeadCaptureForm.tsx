"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLeadSchema, CreateLeadInput } from "@/lib/validations";
import { StepCaseDetails } from "@/components/forms/steps/StepCaseDetails";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";

export function LeadCaptureForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
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
    <div className="mx-auto w-full max-w-xl">
      <Stepper steps={["Dados pessoais", "Seu caso"]} currentStep={2} />

      <Card>
        <h2 className="text-h3 text-foreground">Conte o que aconteceu</h2>
        <p className="mb-6 mt-1 text-small text-foreground-secondary">
          Quanto mais detalhes você fornecer, melhor poderemos encontrar profissionais adequados.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <StepCaseDetails register={register} errors={errors} watch={watch} />

          {submitError && <p className="text-small font-medium text-destructive">{submitError}</p>}

          <Button type="submit" variant="success" size="lg" isLoading={isSubmitting}>
            Enviar meu caso
          </Button>
        </form>
      </Card>
    </div>
  );
}
