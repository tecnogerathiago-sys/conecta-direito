"use client";

import { useState } from "react";
import { Check, CreditCard, QrCode } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { PixCheckoutPanel } from "@/components/dashboard/PixCheckoutPanel";
import { PAYMENTS_ENABLED } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import type { SubscriptionPlan } from "@prisma/client";

interface Props {
  plan: SubscriptionPlan;
  name: string;
  priceBRL: number;
  features: string[];
  recommended?: boolean;
  isCurrentPlan?: boolean;
}

interface PixPayment {
  qrCode: string | null;
  qrCodeBase64: string | null;
  dueDate: string;
}

export function PlanCard({ plan, name, priceBRL, features, recommended, isCurrentPlan }: Props) {
  const [loadingMethod, setLoadingMethod] = useState<"card" | "pix" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pixPayment, setPixPayment] = useState<PixPayment | null>(null);

  async function handleSubscribe(method: "card" | "pix") {
    setError(null);
    setLoadingMethod(method);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, method }),
      });
      const body = await res.json();

      if (!res.ok) throw new Error(body?.error ?? "Não foi possível iniciar a assinatura.");

      if (method === "card") {
        window.location.href = body.paymentUrl;
        return;
      }

      setPixPayment({
        qrCode: body.payment.qrCode,
        qrCodeBase64: body.payment.qrCodeBase64,
        dueDate: body.payment.dueDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoadingMethod(null);
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
        <p className="mt-1 text-caption text-foreground-muted">Assinatura mensal</p>
      </div>

      <div>
        <p className="text-h1 leading-none text-foreground">{formatBRL(priceBRL)}</p>
        <p className="mt-1 text-small text-foreground-muted">por mês</p>
      </div>

      <ul className="flex flex-col gap-2 border-t border-border pt-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-small text-foreground-secondary">
            <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <Button variant="outline" fullWidth disabled>
          Plano atual
        </Button>
      ) : pixPayment ? (
        <PixCheckoutPanel
          qrCode={pixPayment.qrCode}
          qrCodeBase64={pixPayment.qrCodeBase64}
          dueDate={pixPayment.dueDate}
          onCancel={() => setPixPayment(null)}
        />
      ) : PAYMENTS_ENABLED ? (
        <>
          <div className="flex gap-2">
            <Button
              variant={recommended ? "primary" : "outline"}
              fullWidth
              onClick={() => handleSubscribe("card")}
              isLoading={loadingMethod === "card"}
              disabled={loadingMethod !== null}
            >
              <CreditCard className="size-4" aria-hidden />
              Cartão
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleSubscribe("pix")}
              isLoading={loadingMethod === "pix"}
              disabled={loadingMethod !== null}
            >
              <QrCode className="size-4" aria-hidden />
              Pix
            </Button>
          </div>
          {error && <p className="text-small text-destructive">{error}</p>}
        </>
      ) : (
        <>
          <Button variant="outline" fullWidth disabled>
            Em breve
          </Button>
          <p className="text-caption text-foreground-muted">
            Pagamentos recorrentes chegando em breve. Fale com a gente para liberar acesso manualmente.
          </p>
        </>
      )}
    </div>
  );
}
