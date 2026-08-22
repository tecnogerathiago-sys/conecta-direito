"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  qrCodeBase64: string | null;
  qrCode: string | null;
  dueDate: string;
  onCancel: () => void;
}

export function PixCheckoutPanel({ qrCodeBase64, qrCode, dueDate, onCancel }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  async function copyCode() {
    if (!qrCode) return;
    await navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function checkPayment() {
    setIsChecking(true);
    router.refresh();
    setTimeout(() => setIsChecking(false), 1000);
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-border-strong bg-background-secondary p-4 text-center">
      <p className="text-small font-medium text-foreground">Escaneie o QR code ou copie o código Pix</p>

      {qrCodeBase64 && (
        <img
          src={`data:image/png;base64,${qrCodeBase64}`}
          alt="QR code Pix"
          className="size-44 rounded-md border border-border bg-surface p-2"
        />
      )}

      {qrCode && (
        <Button variant="outline" size="sm" fullWidth onClick={copyCode}>
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? "Copiado!" : "Copiar código Pix"}
        </Button>
      )}

      <p className="text-caption text-foreground-muted">
        Válido até {new Date(dueDate).toLocaleString("pt-BR")}. A assinatura é ativada automaticamente
        assim que o pagamento for confirmado.
      </p>

      <div className="flex w-full gap-2">
        <Button variant="ghost" size="sm" fullWidth onClick={checkPayment} isLoading={isChecking}>
          <RefreshCw className="size-3.5" aria-hidden />
          Já paguei, verificar
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
