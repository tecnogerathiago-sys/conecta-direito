import { Search, X, SlidersHorizontal } from "lucide-react";
import { LegalArea, Urgency } from "@prisma/client";
import { LEGAL_AREA_LABELS, URGENCY_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

interface Props {
  defaultLocation?: string;
  defaultKeyword?: string;
  defaultArea?: string;
  defaultUrgency?: string;
}

export function FilterBar({ defaultLocation, defaultKeyword, defaultArea, defaultUrgency }: Props) {
  const hasActiveFilters = Boolean(defaultLocation || defaultKeyword || defaultArea || defaultUrgency);

  return (
    <form
      method="GET"
      className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-surface p-3.5 shadow-xs"
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
          aria-hidden
        />
        <input
          type="text"
          name="busca"
          placeholder="Buscar por palavra-chave no caso..."
          defaultValue={defaultKeyword}
          aria-label="Buscar por palavra-chave"
          className="h-11 w-full rounded-md border border-border-strong bg-surface pl-10 pr-3.5 text-body text-foreground placeholder:text-foreground-muted transition-colors duration-150 hover:border-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-local" className="text-label text-foreground-secondary">
            Localidade
          </label>
          <input
            id="filter-local"
            type="text"
            name="local"
            placeholder="Cidade ou UF"
            defaultValue={defaultLocation}
            className="h-10 w-40 rounded-md border border-border-strong bg-surface px-3 text-small text-foreground placeholder:text-foreground-muted transition-colors duration-150 hover:border-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-area" className="text-label text-foreground-secondary">
            Área jurídica
          </label>
          <select
            id="filter-area"
            name="area"
            defaultValue={defaultArea ?? ""}
            className="h-10 w-44 rounded-md border border-border-strong bg-surface px-3 text-small text-foreground transition-colors duration-150 hover:border-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
          >
            <option value="">Todas as áreas</option>
            {Object.values(LegalArea).map((area) => (
              <option key={area} value={area}>
                {LEGAL_AREA_LABELS[area]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="filter-urgencia" className="text-label text-foreground-secondary">
            Urgência
          </label>
          <select
            id="filter-urgencia"
            name="urgencia"
            defaultValue={defaultUrgency ?? ""}
            className="h-10 w-36 rounded-md border border-border-strong bg-surface px-3 text-small text-foreground transition-colors duration-150 hover:border-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary"
          >
            <option value="">Qualquer</option>
            {Object.values(Urgency).map((u) => (
              <option key={u} value={u}>
                {URGENCY_LABELS[u]}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="primary" size="md">
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtrar
        </Button>

        {hasActiveFilters && (
          <a
            href="/advogado/dashboard"
            className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-small font-medium text-foreground-secondary transition-colors duration-150 hover:bg-background-secondary hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
            Limpar filtros
          </a>
        )}
      </div>
    </form>
  );
}
