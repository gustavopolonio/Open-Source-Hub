-- DropForeignKey
ALTER TABLE "OauthAccount" DROP CONSTRAINT "OauthAccount_userId_fkey";

-- AddForeignKey
ALTER TABLE "OauthAccount" ADD CONSTRAINT "OauthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
