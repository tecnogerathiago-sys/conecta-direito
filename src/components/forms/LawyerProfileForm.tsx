"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LegalArea } from "@prisma/client";
import { Plus, X } from "lucide-react";
import { lawyerProfileUpdateSchema, LawyerProfileUpdateInput } from "@/lib/validations";
import { LEGAL_AREA_LABELS } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PhotoUploadField } from "@/components/forms/PhotoUploadField";

interface Props {
  email: string;
  oabNumber: string | null;
  oabState: string | null;
  initialData: LawyerProfileUpdateInput;
}

type FormValues = Omit<LawyerProfileUpdateInput, "activeRegions"> & {
  activeRegions: { value: string }[];
};

const formSchema = lawyerProfileUpdateSchema.extend({
  activeRegions: z
    .array(z.object({ value: z.string().trim().min(2, "Informe a cidade/UF.") }))
    .min(1, "Informe ao menos uma cidade/UF onde você atua."),
});

export function LawyerProfileForm({ email, oabNumber, oabState, initialData }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRegion, setNewRegion] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      ...initialData,
      activeRegions: initialData.activeRegions.map((value) => ({ value })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "activeRegions" });
  const fullName = watch("fullName");
  const photoUrl = watch("photoUrl");

  function addRegion() {
    const value = newRegion.trim();
    if (!value) return;
    append({ value });
    setNewRegion("");
  }

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const data: LawyerProfileUpdateInput = {
        ...values,
        activeRegions: values.activeRegions.map((r) => r.value),
      };

      const res = await fetch("/api/lawyers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível salvar as alterações. Tente novamente.");
      }

      setSuccessMessage("Alterações salvas.");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <h2 className="text-h3 text-foreground">Meu perfil</h2>
      <p className="mb-6 mt-1 text-small text-foreground-secondary">
        Esses dados aparecem para clientes quando você manifesta interesse numa causa.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-label font-medium text-foreground">Dados pessoais</legend>
          <PhotoUploadField
            photoUrl={photoUrl}
            avatarName={fullName || "?"}
            onUploaded={(url) => setValue("photoUrl", url, { shouldValidate: true })}
            onUploadingChange={setIsUploadingPhoto}
          />
          {errors.photoUrl?.message && (
            <p className="text-small text-destructive">{errors.photoUrl.message}</p>
          )}
          <Input
            label="Nome completo"
            placeholder="Seu nome completo"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="WhatsApp (login)"
              placeholder="(11) 91234-5678"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input label="E-mail (login)" value={email} disabled hint="Fale com o suporte para alterar." />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-t border-border pt-5">
          <legend className="mb-1 text-label font-medium text-foreground">
            Contato exibido aos clientes <span className="font-normal text-foreground-muted">(opcional)</span>
          </legend>
          <p className="-mt-2 text-caption text-foreground-muted">
            Deixe em branco para usar o WhatsApp e e-mail de login acima.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Telefone de contato"
              placeholder="(11) 3333-4444"
              error={errors.contactPhone?.message}
              {...register("contactPhone")}
            />
            <Input
              label="E-mail de contato"
              type="email"
              placeholder="contato@escritorio.com"
              error={errors.contactEmail?.message}
              {...register("contactEmail")}
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4 border-t border-border pt-5">
          <legend className="mb-1 text-label font-medium text-foreground">Registro na OAB</legend>
          <p className="text-small text-foreground-secondary">
            {oabNumber ? `OAB/${oabState} ${oabNumber}` : "Não informado"}{" "}
            <span className="text-caption text-foreground-muted">— fale com o suporte para alterar.</span>
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-3 border-t border-border pt-5">
          <legend className="mb-1 text-label font-medium text-foreground">Regiões de atuação</legend>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="Cidade/UF"
                placeholder="Ex: São Paulo/SP"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addRegion();
                  }
                }}
              />
            </div>
            <Button type="button" variant="outline" onClick={addRegion}>
              <Plus className="size-4" aria-hidden />
              Adicionar
            </Button>
          </div>
          {fields.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {fields.map((field, i) => (
                <li
                  key={field.id}
                  className="flex items-center gap-1.5 rounded-full bg-primary-subtle px-3 py-1 text-small text-primary"
                >
                  {field.value}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Remover ${field.value}`}
                    className="text-primary/70 hover:text-primary"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {errors.activeRegions?.message && (
            <span className="text-small text-destructive">{errors.activeRegions.message}</span>
          )}
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
        {successMessage && <p className="text-small font-medium text-success">{successMessage}</p>}

        <Button type="submit" variant="success" size="lg" isLoading={isSubmitting} disabled={isUploadingPhoto}>
          Salvar alterações
        </Button>
      </form>
    </Card>
  );
}
