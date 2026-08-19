"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const MESSAGES = {
  advogado: {
    text: "Você está com uma conta de advogado conectada. Para abrir um caso como cliente, saia dessa conta primeiro.",
    redirectTo: "/solicitar",
  },
  cliente: {
    text: "Você está com uma conta de cliente conectada. Para acessar o painel do advogado, saia dessa conta primeiro.",
    redirectTo: "/advogado/entrar",
  },
} as const;

function BannerContent() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const kind = searchParams.get("contaErrada");
  const message = kind === "advogado" || kind === "cliente" ? MESSAGES[kind] : null;

  if (!message || dismissed) return null;

  return (
    <div className="border-b border-warning/20 bg-warning-subtle">
      <div className="mx-auto flex max-w-shell items-start gap-3 px-4 py-3 sm:px-6">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        <p className="flex-1 text-small text-foreground">{message.text}</p>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: message.redirectTo })}>
          Sair e continuar
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso"
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:bg-background-secondary"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function WrongAccountBanner() {
  return (
    <Suspense>
      <BannerContent />
    </Suspense>
  );
}
