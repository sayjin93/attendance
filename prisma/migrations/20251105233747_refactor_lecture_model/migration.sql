/*
  Warnings:

  - You are about to drop the column `classId` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `professorId` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `Lecture` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teachingAssignmentId,date]` on the table `Lecture` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teachingAssignmentId` to the `Lecture` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Lecture` DROP FOREIGN KEY `Lecture_classId_fkey`;

-- DropForeignKey
ALTER TABLE `Lecture` DROP FOREIGN KEY `Lecture_professorId_fkey`;

-- DropForeignKey
ALTER TABLE `Lecture` DROP FOREIGN KEY `Lecture_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `Lecture` DROP FOREIGN KEY `Lecture_typeId_fkey`;

-- DropIndex
DROP INDEX `Lecture_classId_fkey` ON `Lecture`;

-- DropIndex
DROP INDEX `Lecture_professorId_fkey` ON `Lecture`;

-- DropIndex
DROP INDEX `Lecture_subjectId_fkey` ON `Lecture`;

-- DropIndex
DROP INDEX `Lecture_typeId_fkey` ON `Lecture`;

-- AlterTable
ALTER TABLE `Lecture` DROP COLUMN `classId`,
    DROP COLUMN `professorId`,
    DROP COLUMN `subjectId`,
    DROP COLUMN `typeId`,
    ADD COLUMN `teachingAssignmentId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Lecture_teachingAssignmentId_date_key` ON `Lecture`(`teachingAssignmentId`, `date`);

-- AddForeignKey
ALTER TABLE `Lecture` ADD CONSTRAINT `Lecture_teachingAssignmentId_fkey` FOREIGN KEY (`teachingAssignmentId`) REFERENCES `TeachingAssignment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
