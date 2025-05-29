/*
  Warnings:

  - Added the required column `ivEncrypt` to the `OauthAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagEncrypt` to the `OauthAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OauthAccount" ADD COLUMN     "ivEncrypt" TEXT NOT NULL,
ADD COLUMN     "tagEncrypt" TEXT NOT NULL;
