/*
  Warnings:

  - You are about to drop the column `subscriptionStatus` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "subscriptionStatus",
ADD COLUMN     "last_payment_date" TIMESTAMP(3),
ADD COLUMN     "last_payment_status" TEXT,
ADD COLUMN     "subscription_status" TEXT;
