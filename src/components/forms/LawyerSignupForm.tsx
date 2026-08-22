"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LegalArea } from "@prisma/client";
import { Plus, X } from "lucide-react";
import { lawyerSignupSchema, LawyerSignupInput } from "@/lib/validations";
import { LEGAL_AREA_LABELS, BRAZILIAN_STATES } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";

interface Props {
  redirectTo: string;
}

type FormValues = Omit<LawyerSignupInput, "activeRegions"> & {
  activeRegions: { value: string }[];
};

// react-hook-form's useFieldArray precisa de um array de objetos, não de
// strings soltas — este schema espelha lawyerSignupSchema (que continua
// sendo o contrato real da API) só trocando o formato de activeRegions.
const formSchema = lawyerSignupSchema.extend({
  activeRegions: z
    .array(z.object({ value: z.string().trim().min(2, "Informe a cidade/UF.") }))
    .min(1, "Informe ao menos uma cidade/UF onde você atua."),
});

export function LawyerSignupForm({ redirectTo }: Props) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRegion, setNewRegion] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { activeRegions: [] },
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
    setIsSubmitting(true);
    try {
      const data: LawyerSignupInput = {
        ...values,
        activeRegions: values.activeRegions.map((r) => r.value),
      };

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
          <div className="flex items-center gap-3">
            <Avatar name={fullName || "?"} size="md" />
            <div className="flex-1">
              <Input
                label="URL da foto de perfil (opcional)"
                placeholder="https://..."
                error={errors.photoUrl?.message}
                {...register("photoUrl")}
              />
            </div>
          </div>
          {photoUrl && (
            <p className="text-caption text-foreground-muted">
              Dica: se a imagem não aparecer no avatar acima, confira se o link é público e aponta
              direto para o arquivo.
            </p>
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
            <Input
              label="E-mail (login)"
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

        <Button type="submit" variant="success" size="lg" isLoading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </Card>
  );
}
