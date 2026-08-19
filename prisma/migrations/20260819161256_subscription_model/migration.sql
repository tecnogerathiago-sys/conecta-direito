-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('BASICO', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LAWYER_INTEREST', 'CONTACT_ACCEPTED', 'CONTACT_DECLINED');

-- DropForeignKey
ALTER TABLE "lead_unlocks" DROP CONSTRAINT "lead_unlocks_lawyerId_fkey";

-- DropForeignKey
ALTER TABLE "lead_unlocks" DROP CONSTRAINT "lead_unlocks_leadId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_coinPackageId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "coinCost",
DROP COLUMN "maxUnlocks",
ADD COLUMN     "maxInterests" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "coinBalance";

-- DropTable
DROP TABLE "coin_packages";

-- DropTable
DROP TABLE "lead_unlocks";

-- DropTable
DROP TABLE "transactions";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateTable
CREATE TABLE "interest_manifestations" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',
    "contactReleasedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_manifestations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "priceBRL" DECIMAL(10,2) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewsAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "paymentProvider" TEXT,
    "externalSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "leadId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interest_manifestations_lawyerId_idx" ON "interest_manifestations"("lawyerId");

-- CreateIndex
CREATE INDEX "interest_manifestations_leadId_idx" ON "interest_manifestations"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "interest_manifestations_leadId_lawyerId_key" ON "interest_manifestations"("leadId", "lawyerId");

-- CreateIndex
CREATE INDEX "subscriptions_lawyerId_idx" ON "subscriptions"("lawyerId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "interest_manifestations" ADD CONSTRAINT "interest_manifestations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_manifestations" ADD CONSTRAINT "interest_manifestations_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

