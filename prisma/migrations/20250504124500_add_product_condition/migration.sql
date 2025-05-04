-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'DAMAGED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "condition" "ProductCondition" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN "condition" "ProductCondition" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "TransferItem" ADD COLUMN "condition" "ProductCondition" NOT NULL DEFAULT 'NEW';
