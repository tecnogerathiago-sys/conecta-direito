import { UseFormRegister, FieldErrors } from "react-hook-form";
import { LegalArea, Urgency } from "@prisma/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CreateLeadInput } from "@/lib/validations";
import { LEGAL_AREA_LABELS, URGENCY_LABELS, BRAZILIAN_STATES } from "@/lib/constants";

interface Props {
  register: UseFormRegister<CreateLeadInput>;
  errors: FieldErrors<CreateLeadInput>;
}

export function StepCaseDetails({ register, errors }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Select label="Área do direito" error={errors.legalArea?.message} {...register("legalArea")}>
        <option value="">Selecione a área</option>
        {Object.values(LegalArea).map((area) => (
          <option key={area} value={area}>
            {LEGAL_AREA_LABELS[area]}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-primary-700">
          Descreva sua situação
        </label>
        <textarea
          id="description"
          rows={5}
          placeholder="Explique o que aconteceu com o máximo de detalhes possível..."
          className="rounded-lg border border-primary-100 px-3.5 py-2.5 text-sm text-primary-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          {...register("description")}
        />
        {errors.description?.message && (
          <span className="text-xs font-medium text-red-500">{errors.description.message}</span>
        )}
      </div>

      <Select label="Urgência" error={errors.urgency?.message} {...register("urgency")}>
        <option value="">Selecione a urgência</option>
        {Object.values(Urgency).map((urgency) => (
          <option key={urgency} value={urgency}>
            {URGENCY_LABELS[urgency]}
          </option>
        ))}
      </Select>

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
    </div>
  );
}
