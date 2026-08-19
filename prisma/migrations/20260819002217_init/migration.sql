-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('LAWYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "LegalArea" AS ENUM ('TRABALHISTA', 'FAMILIA', 'CONSUMIDOR', 'CIVEL', 'CRIMINAL', 'EMPRESARIAL', 'PREVIDENCIARIO', 'TRIBUTARIO', 'OUTROS');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('OPEN', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'UNLOCK_SPEND', 'REFUND', 'BONUS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'LAWYER',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "oabNumber" TEXT,
    "oabState" TEXT,
    "phone" TEXT,
    "areasOfPractice" "LegalArea"[] DEFAULT ARRAY[]::"LegalArea"[],
    "activeRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coinBalance" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "legalArea" "LegalArea" NOT NULL,
    "description" TEXT NOT NULL,
    "urgency" "Urgency" NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'OPEN',
    "maxUnlocks" INTEGER NOT NULL DEFAULT 3,
    "coinCost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_unlocks" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "coinsSpent" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "coinAmount" INTEGER NOT NULL,
    "amountBRL" DECIMAL(10,2),
    "coinPackageId" TEXT,
    "paymentStatus" "PaymentStatus",
    "paymentProvider" TEXT,
    "externalPaymentId" TEXT,
    "leadUnlockId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coinAmount" INTEGER NOT NULL,
    "bonusCoins" INTEGER NOT NULL DEFAULT 0,
    "priceBRL" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coin_packages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_oabNumber_key" ON "users"("oabNumber");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_legalArea_city_idx" ON "leads"("legalArea", "city");

-- CreateIndex
CREATE INDEX "lead_unlocks_lawyerId_idx" ON "lead_unlocks"("lawyerId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_unlocks_leadId_lawyerId_key" ON "lead_unlocks"("leadId", "lawyerId");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- AddForeignKey
ALTER TABLE "lead_unlocks" ADD CONSTRAINT "lead_unlocks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_unlocks" ADD CONSTRAINT "lead_unlocks_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_coinPackageId_fkey" FOREIGN KEY ("coinPackageId") REFERENCES "coin_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
