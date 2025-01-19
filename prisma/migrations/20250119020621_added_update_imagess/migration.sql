-- AlterTable
ALTER TABLE `images` ADD COLUMN `isSlider` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `title` VARCHAR(191) NULL;
