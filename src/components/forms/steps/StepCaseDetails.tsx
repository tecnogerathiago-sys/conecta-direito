import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { LegalArea, Urgency } from "@prisma/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { CreateLeadInput } from "@/lib/validations";
import { LEGAL_AREA_LABELS, URGENCY_LABELS, BRAZILIAN_STATES } from "@/lib/constants";

interface Props {
  register: UseFormRegister<CreateLeadInput>;
  errors: FieldErrors<CreateLeadInput>;
  watch: UseFormWatch<CreateLeadInput>;
}

const DESCRIPTION_MAX = 1000;

export function StepCaseDetails({ register, errors, watch }: Props) {
  const description = watch("description") ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Select label="Área jurídica" error={errors.legalArea?.message} {...register("legalArea")}>
            <option value="">Selecione a área</option>
            {Object.values(LegalArea).map((area) => (
              <option key={area} value={area}>
                {LEGAL_AREA_LABELS[area]}
              </option>
            ))}
          </Select>
        </div>
        <Select label="Urgência" error={errors.urgency?.message} {...register("urgency")}>
          <option value="">Selecione</option>
          {Object.values(Urgency).map((urgency) => (
            <option key={urgency} value={urgency}>
              {URGENCY_LABELS[urgency]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Input label="Cidade" placeholder="Sua cidade" error={errors.city?.message} {...register("city")} />
        </div>
        <Select label="UF" error={errors.state?.message} {...register("state")}>
          <option value="">UF</option>
          {BRAZILIAN_STATES.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Descrição do caso"
        placeholder="Explique o que aconteceu com o máximo de detalhes possível..."
        rows={6}
        maxLength={DESCRIPTION_MAX}
        currentLength={description.length}
        error={errors.description?.message}
        {...register("description")}
      />
    </div>
  );
}
