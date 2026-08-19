"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2, Clock, XCircle, Phone, Mail, IdCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReleasedContact } from "@/lib/masking";
import type { InterestStatus } from "@prisma/client";

interface Props {
  leadId: string;
  hasActiveSubscription: boolean;
  remainingSlots: number;
  initialStatus: InterestStatus | null;
  releasedContact: ReleasedContact | null;
}

export function InterestButton({
  leadId,
  hasActiveSubscription,
  remainingSlots,
  initialStatus,
  releasedContact,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<InterestStatus | null>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleManifest() {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/interest`, { method: "POST" });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.error ?? "Não foi possível manifestar interesse.");
      }

      setStatus(body.status as InterestStatus);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === "ACCEPTED" && releasedContact) {
    return (
      <div className="rounded-md border border-success/20 bg-success-subtle p-3.5">
        <p className="flex items-center gap-1.5 text-small font-semibold text-success">
          <CheckCircle2 className="size-4" aria-hidden />
          Contato liberado pelo cliente
        </p>
        <dl className="mt-2.5 space-y-1.5 text-small">
          <div className="flex items-center gap-2 text-foreground">
            <IdCard className="size-3.5 shrink-0 text-foreground-muted" aria-hidden />
            <span className="font-medium">{releasedContact.fullName}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Phone className="size-3.5 shrink-0 text-foreground-muted" aria-hidden />
            <span>{releasedContact.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Mail className="size-3.5 shrink-0 text-foreground-muted" aria-hidden />
            <span className="truncate">{releasedContact.email}</span>
          </div>
        </dl>
      </div>
    );
  }

  if (status === "DECLINED") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-background-secondary p-3.5 text-small text-foreground-secondary">
        <XCircle className="size-4 shrink-0" aria-hidden />
        O cliente optou por não liberar o contato desta vez.
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-info/20 bg-info-subtle p-3.5 text-small text-foreground">
        <Clock className="size-4 shrink-0 text-info" aria-hidden />
        Interesse enviado — aguardando resposta do cliente.
      </div>
    );
  }

  if (remainingSlots <= 0) {
    return (
      <Button variant="outline" disabled fullWidth>
        <Lock className="size-4" aria-hidden />
        Limite de advogados interessados atingido
      </Button>
    );
  }

  if (!hasActiveSubscription) {
    return (
      <div className="rounded-md border border-warning/20 bg-warning-subtle p-3.5">
        <p className="text-small text-foreground">
          Sua assinatura precisa estar ativa para manifestar interesse em causas.
        </p>
        <Link href="/advogado/assinatura" className="mt-3 block">
          <Button variant="accent" fullWidth size="sm">
            Ver planos de assinatura
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="success" fullWidth isLoading={isSubmitting} onClick={handleManifest}>
        Tenho interesse neste caso
      </Button>
      {error && <p className="text-small font-medium text-destructive">{error}</p>}
    </div>
  );
}
