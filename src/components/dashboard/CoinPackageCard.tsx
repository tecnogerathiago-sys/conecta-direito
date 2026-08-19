"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PAYMENTS_ENABLED } from "@/lib/constants";

interface Props {
  id: string;
  name: string;
  coinAmount: number;
  bonusCoins: number;
  totalCoins: number;
  priceBRL: number;
}

export function CoinPackageCard({ id, name, coinAmount, bonusCoins, totalCoins, priceBRL }: Props) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <Card className="flex flex-col items-center gap-3 text-center">
      {bonusCoins > 0 && <Badge tone="accent">+{bonusCoins} de bônus</Badge>}
      <h3 className="text-base font-bold text-primary-900">{name}</h3>
      <p className="text-3xl font-extrabold text-accent-600">
        {totalCoins}
        <span className="ml-1 text-sm font-medium text-slate-500">moedas</span>
      </p>
      {bonusCoins > 0 && (
        <p className="text-xs text-slate-500">
          {coinAmount} base + {bonusCoins} bônus
        </p>
      )}
      <p className="text-lg font-semibold text-primary-900">
        {priceBRL.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>
      {PAYMENTS_ENABLED ? (
        <>
          <Button variant="accent" fullWidth onClick={handleBuy} disabled={isRedirecting}>
            {isRedirecting ? "Redirecionando..." : "Comprar"}
          </Button>
          {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </>
      ) : (
        <>
          <Button variant="outline" fullWidth disabled>
            Em breve
          </Button>
          <p className="text-xs text-slate-500">
            Pagamentos chegando em breve. Fale com a gente para liberar moedas manualmente.
          </p>
        </>
      )}
    </Card>
  );
}
