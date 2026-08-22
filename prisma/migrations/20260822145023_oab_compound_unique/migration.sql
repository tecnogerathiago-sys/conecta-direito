-- DropIndex
DROP INDEX "users_oabNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "users_oabNumber_oabState_key" ON "users"("oabNumber", "oabState");
