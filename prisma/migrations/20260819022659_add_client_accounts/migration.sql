-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'CLIENT';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "clientId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "cpf" TEXT,
ALTER COLUMN "role" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "leads_clientId_idx" ON "leads"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

