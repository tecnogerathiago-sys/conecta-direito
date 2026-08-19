import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { FileText } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/shell/AppShell";
import { NavGroup } from "@/components/shell/types";

const navGroups: NavGroup[] = [
  {
    title: "Principal",
    items: [
      { label: "Meus casos", href: "/cliente/dashboard", icon: <FileText className="size-4.5" aria-hidden /> },
    ],
  },
];

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/cliente/entrar?next=/cliente/dashboard");
  }
  if (session.user.role !== "CLIENT") {
    redirect("/");
  }

  return (
    <AppShell brandHref="/cliente/dashboard" navGroups={navGroups} userName={session.user.name ?? "Você"}>
      {children}
    </AppShell>
  );
}
