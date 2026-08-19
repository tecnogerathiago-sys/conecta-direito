import { Info } from "lucide-react";

interface Props {
  text: string;
}

/**
 * Aviso informativo curto, usado nos pontos do fluxo onde vale deixar
 * explícito que a plataforma só divulga informação e viabiliza contato —
 * quem decide contratar é sempre o cliente (Provimento 205/2021 da OAB).
 */
export function ComplianceNotice({ text }: Props) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-background-secondary px-3.5 py-3 text-caption text-foreground-muted">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <p>{text}</p>
    </div>
  );
}
