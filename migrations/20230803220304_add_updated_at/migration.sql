/*
  Warnings:

  - Added the required column `updated_at` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "updated_at" STRING NOT NULL;
