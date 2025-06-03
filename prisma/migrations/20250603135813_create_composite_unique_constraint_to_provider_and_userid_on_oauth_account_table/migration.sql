/*
  Warnings:

  - A unique constraint covering the columns `[provider,userId]` on the table `OauthAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OauthAccount_provider_userId_key" ON "OauthAccount"("provider", "userId");
