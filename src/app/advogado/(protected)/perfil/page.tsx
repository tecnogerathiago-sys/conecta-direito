import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LawyerProfileForm } from "@/components/forms/LawyerProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/advogado/entrar");

  const lawyer = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      oabNumber: true,
      oabState: true,
      contactPhone: true,
      contactEmail: true,
      photoUrl: true,
      areasOfPractice: true,
      activeRegions: true,
    },
  });

  if (!lawyer) redirect("/advogado/entrar");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Meu perfil" description="Mantenha seus dados atualizados." />
      <LawyerProfileForm
        email={lawyer.email}
        oabNumber={lawyer.oabNumber}
        oabState={lawyer.oabState}
        initialData={{
          fullName: lawyer.name,
          phone: lawyer.phone ?? "",
          contactPhone: lawyer.contactPhone ?? "",
          contactEmail: lawyer.contactEmail ?? "",
          photoUrl: lawyer.photoUrl ?? "",
          areasOfPractice: lawyer.areasOfPractice,
          activeRegions: lawyer.activeRegions,
        }}
      />
    </div>
  );
}
