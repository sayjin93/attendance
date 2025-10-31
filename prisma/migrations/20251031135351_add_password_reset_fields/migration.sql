/*
  Warnings:

  - A unique constraint covering the columns `[passwordResetToken]` on the table `Professor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Professor` ADD COLUMN `passwordResetExpires` DATETIME(3) NULL,
    ADD COLUMN `passwordResetToken` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Professor_passwordResetToken_key` ON `Professor`(`passwordResetToken`);
