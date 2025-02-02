/*
  Warnings:

  - You are about to alter the column `status` on the `Attendance` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - Added the required column `professorId` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Class_name_key` ON `Class`;

-- AlterTable
ALTER TABLE `Attendance` MODIFY `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Class` ADD COLUMN `professorId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Professor` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Professor_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_professorId_fkey` FOREIGN KEY (`professorId`) REFERENCES `Professor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
