/*
  Warnings:

  - Added the required column `gitHubStars` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `submittedBy` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_submittedBy_fkey";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gitHubStars" INTEGER NOT NULL,
ADD COLUMN     "license" TEXT,
ADD COLUMN     "liveLink" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "programmingLanguage" TEXT,
ALTER COLUMN "submittedBy" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
