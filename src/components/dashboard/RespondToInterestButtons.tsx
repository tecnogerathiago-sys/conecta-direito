"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { InterestStatus } from "@prisma/client";

interface Props {
  interestId: string;
  initialStatus: InterestStatus;
}

const RESOLVED_LABEL: Partial<Record<InterestStatus, string>> = {
  ACCEPTED: "Contato liberado",
  DECLINED: "Contato não liberado",
};

export function RespondToInterestButtons({ interestId, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<InterestStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(decision: "accept" | "decline") {
    setError(null);
    setIsSubmitting(decision);
    try {
      const res = await fetch(`/api/interests/${interestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const body = await res.json();

      if (!res.ok) throw new Error(body?.error ?? "Não foi possível registrar sua resposta.");

      setStatus(body.status as InterestStatus);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsSubmitting(null);
    }
  }

  if (status !== "PENDING") {
    return (
      <Badge tone={status === "ACCEPTED" ? "success" : "neutral"}>
        {status === "ACCEPTED" ? (
          <CheckCircle2 className="size-3.5" aria-hidden />
        ) : (
          <XCircle className="size-3.5" aria-hidden />
        )}
        {RESOLVED_LABEL[status]}
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Button
          variant="success"
          size="sm"
          isLoading={isSubmitting === "accept"}
          disabled={isSubmitting !== null}
          onClick={() => respond("accept")}
        >
          Aceitar contato
        </Button>
        <Button
          variant="outline"
          size="sm"
          isLoading={isSubmitting === "decline"}
          disabled={isSubmitting !== null}
          onClick={() => respond("decline")}
        >
          Recusar
        </Button>
      </div>
      {error && <p className="text-caption text-destructive">{error}</p>}
    </div>
  );
}
