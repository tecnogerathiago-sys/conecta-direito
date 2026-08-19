"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PAYMENTS_ENABLED } from "@/lib/constants";
import { formatBRL } from "@/lib/format";

interface Props {
  id: string;
  name: string;
  coinAmount: number;
  bonusCoins: number;
  totalCoins: number;
  priceBRL: number;
  recommended?: boolean;
  savingsPercent?: number;
}

export function CoinPackageCard({
  id,
  name,
  coinAmount,
  bonusCoins,
  totalCoins,
  priceBRL,
  recommended,
  savingsPercent,
}: Props) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pricePerCoin = priceBRL / totalCoins;

  async function handleBuy() {
    setError(null);
    setIsRedirecting(true);
    try {
      const res = await fetch(`/api/coin-packages/${id}/checkout`, { method: "POST" });
      const body = await res.json();

      if (!res.ok) throw new Error(body?.error ?? "Não foi possível iniciar a compra.");

      // Em produção, body.paymentUrl aponta para o checkout do gateway (Pix / Cartão).
      window.location.href = body.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setIsRedirecting(false);
    }
  }

  return (
    <div
      className={clsx(
        "relative flex flex-col gap-4 rounded-lg border bg-surface p-5",
        recommended ? "border-primary shadow-md" : "border-border shadow-xs"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-5 rounded-sm bg-primary px-2 py-0.5 text-caption font-semibold text-primary-foreground">
          Recomendado
        </span>
      )}

      <div>
        <h3 className="text-h3 text-foreground">{name}</h3>
        {bonusCoins > 0 && (
          <p className="mt-0.5 flex items-center gap-1 text-small text-success">
            <Check className="size-3.5" aria-hidden />
            {coinAmount} + {bonusCoins} moedas de bônus
          </p>
        )}
      </div>

      <div>
        <p className="text-display leading-none text-foreground">{totalCoins}</p>
        <p className="mt-1 text-small text-foreground-muted">moedas</p>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-h2 text-foreground">{formatBRL(priceBRL)}</p>
        <div className="mt-1 flex items-center gap-2 text-small text-foreground-secondary">
          <span>{formatBRL(pricePerCoin)} / moeda</span>
          {savingsPercent ? (
            <Badge tone="success">Economize {savingsPercent}%</Badge>
          ) : null}
        </div>
      </div>

      {PAYMENTS_ENABLED ? (
        <>
          <Button
            variant={recommended ? "primary" : "outline"}
            fullWidth
            onClick={handleBuy}
            isLoading={isRedirecting}
          >
            Comprar moedas
          </Button>
          {error && <p className="text-small text-destructive">{error}</p>}
        </>
      ) : (
        <>
          <Button variant="outline" fullWidth disabled>
            Em breve
          </Button>
          <p className="text-caption text-foreground-muted">
            Pagamentos chegando em breve. Fale com a gente para liberar moedas manualmente.
          </p>
        </>
      )}
    </div>
  );
}
