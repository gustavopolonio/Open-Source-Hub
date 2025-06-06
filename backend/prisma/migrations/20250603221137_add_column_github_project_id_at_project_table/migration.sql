/*
  Warnings:

  - A unique constraint covering the columns `[gitHubProjectId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gitHubProjectId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "gitHubProjectId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_gitHubProjectId_key" ON "Project"("gitHubProjectId");
