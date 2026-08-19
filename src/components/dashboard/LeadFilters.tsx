import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  defaultLocation?: string;
  defaultKeyword?: string;
}

export function LeadFilters({ defaultLocation, defaultKeyword }: Props) {
  const hasActiveFilters = Boolean(defaultLocation || defaultKeyword);

  return (
    <form method="GET" className="mb-6 flex flex-wrap items-end gap-3">
      <div className="w-full sm:w-56">
        <Input
          label="Localidade"
          name="local"
          placeholder="Cidade ou UF"
          defaultValue={defaultLocation}
        />
      </div>
      <div className="w-full sm:w-72">
        <Input
          label="Palavra-chave"
          name="busca"
          placeholder="Ex: rescisão, divórcio, contrato..."
          defaultValue={defaultKeyword}
        />
      </div>
      <Button type="submit" variant="primary">
        Filtrar
      </Button>
      {hasActiveFilters && (
        <Link
          href="/advogado/dashboard"
          className="text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-primary-900"
        >
          Limpar filtros
        </Link>
      )}
    </form>
  );
}
