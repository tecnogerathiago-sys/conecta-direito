"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2, Phone, Mail, IdCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UnlockedLead } from "@/lib/masking";

interface Props {
  leadId: string;
  coinCost: number;
  coinBalance: number;
  remainingSlots: number;
  initialUnlocked: UnlockedLead | null;
}

type Stage = "idle" | "confirming" | "unlocking";

export function UnlockButton({ leadId, coinCost, coinBalance, remainingSlots, initialUnlocked }: Props) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<UnlockedLead | null>(initialUnlocked);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);

  const hasEnoughCoins = coinBalance >= coinCost;

  async function handleConfirm() {
    setError(null);
    setStage("unlocking");
    try {
      const res = await fetch(`/api/leads/${leadId}/unlock`, { method: "POST" });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.error ?? "Não foi possível desbloquear este contato.");
      }

      setUnlocked(body.lead as UnlockedLead);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
      setStage("idle");
    }
  }

  if (unlocked) {
    return (
      <div className="rounded-md border border-success/20 bg-success-subtle p-3.5">
        <p className="flex items-center gap-1.5 text-small font-semibold text-success">
          <CheckCircle2 className="size-4" aria-hidden />
          Contato desbloqueado
        </p>
        <dl className="mt-2.5 space-y-1.5 text-small">
          <div className="flex items-center gap-2 text-foreground">
            <IdCard className="size-3.5 shrink-0 text-foreground-muted" aria-hidden />
            <span className="font-medium">{unlocked.fullName}</span>
            <span className="text-foreground-muted">· {unlocked.cpf}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Phone className="size-3.5 shrink-0 text-foreground-muted" aria-hidden />
            <span>{unlocked.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Mail className="size-3.5 shrink-0 text-foreground-muted" aria-hidden />
            <span className="truncate">{unlocked.email}</span>
          </div>
        </dl>
      </div>
    );
  }

  if (remainingSlots <= 0) {
    return (
      <Button variant="outline" disabled fullWidth>
        <Lock className="size-4" aria-hidden />
        Limite de advogados atingido
      </Button>
    );
  }

  if (stage === "confirming" || stage === "unlocking") {
    if (!hasEnoughCoins) {
      const missing = coinCost - coinBalance;
      return (
        <div className="rounded-md border border-warning/20 bg-warning-subtle p-3.5">
          <p className="text-small text-foreground">
            Você precisa de mais <strong>{missing} moedas</strong> para desbloquear este contato.
          </p>
          <div className="mt-3 flex gap-2">
            <Link href="/advogado/carteira" className="flex-1">
              <Button variant="accent" fullWidth size="sm">
                Comprar moedas
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setStage("idle")}>
              Cancelar
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-md border border-border-strong bg-background-secondary p-3.5">
        <p className="text-small text-foreground">
          Você vai usar <strong>{coinCost} moedas</strong> para acessar os dados deste cliente.
        </p>
        <p className="mt-1 text-caption text-foreground-muted">
          Saldo atual: {coinBalance} → {coinBalance - coinCost} moedas
        </p>
        {error && <p className="mt-2 text-small text-destructive">{error}</p>}
        <div className="mt-3 flex gap-2">
          <Button
            variant="success"
            size="sm"
            fullWidth
            isLoading={stage === "unlocking"}
            onClick={handleConfirm}
          >
            Confirmar desbloqueio
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStage("idle")} disabled={stage === "unlocking"}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="success" fullWidth onClick={() => setStage("confirming")}>
      Desbloquear contato · {coinCost} moedas
    </Button>
  );
}
