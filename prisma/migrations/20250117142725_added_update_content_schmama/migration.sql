/*
  Warnings:

  - You are about to drop the column `author` on the `content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `content` DROP COLUMN `author`,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `updated_by` INTEGER NULL;
