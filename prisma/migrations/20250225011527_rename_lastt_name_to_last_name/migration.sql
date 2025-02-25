/*
  Warnings:

  - You are about to drop the column `lasttName` on the `Student` table. All the data in the column will be lost.
  - Added the required column `lastName` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Student` DROP COLUMN `lasttName`,
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL;
