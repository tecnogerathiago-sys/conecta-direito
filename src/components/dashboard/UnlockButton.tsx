"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UnlockedLead } from "@/lib/masking";

interface Props {
  leadId: string;
  coinCost: number;
  remainingSlots: number;
  initialUnlocked: UnlockedLead | null;
}

export function UnlockButton({ leadId, coinCost, remainingSlots, initialUnlocked }: Props) {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<UnlockedLead | null>(initialUnlocked);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setError(null);
    setIsUnlocking(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/unlock`, { method: "POST" });
      const body = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          router.push("/advogado/carteira");
          return;
        }
        throw new Error(body?.error ?? "Não foi possível desbloquear este lead.");
      }

      setUnlocked(body.lead as UnlockedLead);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsUnlocking(false);
    }
  }

  if (unlocked) {
    return (
      <div className="rounded-lg bg-success-50 p-4 text-sm">
        <p className="font-semibold text-success-600">Contato desbloqueado</p>
        <dl className="mt-2 space-y-1 text-primary-900">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Nome</dt>
            <dd className="font-medium">{unlocked.fullName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">CPF</dt>
            <dd className="font-medium">{unlocked.cpf}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">WhatsApp</dt>
            <dd className="font-medium">{unlocked.phone}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">E-mail</dt>
            <dd className="font-medium">{unlocked.email}</dd>
          </div>
        </dl>
      </div>
    );
  }

  if (remainingSlots <= 0) {
    return (
      <Button variant="outline" disabled fullWidth>
        Limite de advogados atingido
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="success" fullWidth onClick={handleUnlock} disabled={isUnlocking}>
        {isUnlocking ? "Desbloqueando..." : `Desbloquear contato (${coinCost} moedas)`}
      </Button>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
