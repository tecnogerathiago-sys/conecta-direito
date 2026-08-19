import { Coins } from "lucide-react";

export function WalletCard({ balance }: { balance: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-primary p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-label text-primary-foreground/70">Sua carteira</p>
        <p className="mt-1 text-display text-primary-foreground">
          {balance.toLocaleString("pt-BR")} <span className="text-h2 font-normal">moedas</span>
        </p>
        <p className="mt-1 text-small text-primary-foreground/70">
          Você possui moedas disponíveis para desbloquear novos clientes.
        </p>
      </div>
      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
        <Coins className="size-6" aria-hidden />
      </div>
    </div>
  );
}
