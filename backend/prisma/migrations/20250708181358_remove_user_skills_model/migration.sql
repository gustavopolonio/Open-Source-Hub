/*
  Warnings:

  - You are about to drop the `UserSkills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSkills" DROP CONSTRAINT "UserSkills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "UserSkills" DROP CONSTRAINT "UserSkills_userId_fkey";

-- DropTable
DROP TABLE "UserSkills";
