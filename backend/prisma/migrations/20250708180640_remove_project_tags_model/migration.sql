/*
  Warnings:

  - You are about to drop the `ProjectTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectTags" DROP CONSTRAINT "ProjectTags_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectTags" DROP CONSTRAINT "ProjectTags_tagId_fkey";

-- DropTable
DROP TABLE "ProjectTags";
