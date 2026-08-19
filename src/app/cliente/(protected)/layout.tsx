import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/ui/LogoutButton";

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/cliente/entrar?next=/cliente/dashboard");
  }
  if (session.user.role !== "CLIENT") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <header className="border-b border-primary-100 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-6">
            <Link href="/cliente/dashboard" className="font-bold text-primary-900">
              Conecta Direito
            </Link>
            <Link href="/solicitar" className="text-sm font-medium text-slate-600 hover:text-primary-900">
              Abrir novo caso
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
