-- Migration: Add avatar column to User and Driver tables
-- Run this SQL on your remote database (Hosting panel > phpMyAdmin or Database > SQL)

ALTER TABLE `User`
  ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(500) NULL COMMENT 'Profile photo URL';

ALTER TABLE `Driver`
  ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(500) NULL COMMENT 'Profile photo URL (updated on selfie upload)';
