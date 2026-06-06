/*
  Warnings:

  - You are about to drop the column `refreshTokenHash` on the `UserSession` table. All the data in the column will be lost.
  - Added the required column `refreshToken` to the `UserSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserSession" DROP COLUMN "refreshTokenHash",
ADD COLUMN     "refreshToken" TEXT NOT NULL;
