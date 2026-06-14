/*
  Warnings:

  - You are about to drop the column `sourceRefrence` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "sourceRefrence",
ADD COLUMN     "sourceReference" JSONB;
