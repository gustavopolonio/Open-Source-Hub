/*
  Warnings:

  - You are about to drop the column `repo_url` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `User` table. All the data in the column will be lost.
  - Added the required column `repoUrl` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "repo_url",
ADD COLUMN     "repoUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_hash",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL;
