import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { CreateLeadInput } from "@/lib/validations";

interface Props {
  register: UseFormRegister<CreateLeadInput>;
  errors: FieldErrors<CreateLeadInput>;
}

export function StepPersonalData({ register, errors }: Props) {
  return (
    <div className="flex flex-col gap-4">
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Telefone / WhatsApp"
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
      <p className="text-xs text-slate-500">
        Seus dados pessoais são protegidos e só são compartilhados com o
        advogado que assumir o seu caso.
      </p>
    </div>
  );
}
