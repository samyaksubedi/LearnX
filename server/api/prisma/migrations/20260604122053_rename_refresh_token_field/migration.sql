/*
  Warnings:

  - You are about to drop the column `hashRefreshToken` on the `UserSession` table. All the data in the column will be lost.
  - Added the required column `refreshTokenHash` to the `UserSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "hashRefreshToken",
ADD COLUMN     "refreshTokenHash" TEXT NOT NULL;
