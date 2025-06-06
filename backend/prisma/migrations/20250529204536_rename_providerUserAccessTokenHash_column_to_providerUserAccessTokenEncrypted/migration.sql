/*
  Warnings:

  - You are about to drop the column `providerUserAccessTokenHash` on the `OauthAccount` table. All the data in the column will be lost.
  - Added the required column `providerUserAccessTokenEncrypted` to the `OauthAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OauthAccount" DROP COLUMN "providerUserAccessTokenHash",
ADD COLUMN     "providerUserAccessTokenEncrypted" TEXT NOT NULL;
