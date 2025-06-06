-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GITHUB');

-- CreateTable
CREATE TABLE "OauthAccount" (
    "id" SERIAL NOT NULL,
    "provider" "Provider" NOT NULL DEFAULT 'GITHUB',
    "providerUserId" TEXT NOT NULL,
    "providerUserAccessTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "OauthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OauthAccount_providerUserId_key" ON "OauthAccount"("providerUserId");

-- AddForeignKey
ALTER TABLE "OauthAccount" ADD CONSTRAINT "OauthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
