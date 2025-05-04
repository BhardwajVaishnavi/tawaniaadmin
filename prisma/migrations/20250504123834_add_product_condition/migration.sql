/*
  Warnings:

  - The values [QUARANTINED] on the enum `InventoryStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [EXPIRE,ADJUST,BONUS] on the enum `LoyaltyTransactionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [LOYALTY_POINTS,GIFT_CARD] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [SUBMITTED,ORDERED] on the enum `PurchaseOrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING_APPROVAL,PARTIALLY_RECEIVED,RECEIVED] on the enum `TransferStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [WAREHOUSE_TO_WAREHOUSE,WAREHOUSE_TO_STORE,STORE_TO_WAREHOUSE,STORE_TO_STORE] on the enum `TransferType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assignedAisles` on the `AuditAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `assignedBins` on the `AuditAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `assignedShelves` on the `AuditAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `actualQuantity` on the `AuditItem` table. All the data in the column will be lost.
  - You are about to drop the column `variance` on the `AuditItem` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `wholesalePrice` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to alter the column `costPrice` on the `InventoryItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `retailPrice` on the `InventoryItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `minimumPurchase` on the `LoyaltyProgram` table. All the data in the column will be lost.
  - You are about to drop the column `pointsPerCurrency` on the `LoyaltyProgram` table. All the data in the column will be lost.
  - You are about to alter the column `pointsMultiplier` on the `LoyaltyProgramTier` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to drop the column `expiryDate` on the `LoyaltyTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `saleId` on the `LoyaltyTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `dimensions` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `maxStockLevel` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `costPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `wholesalePrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `retailPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `deliveredDate` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `shipping` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `PurchaseOrder` table. All the data in the column will be lost.
  - The `status` column on the `PurchaseOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `subtotal` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `description` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `orderedQuantity` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to alter the column `unitPrice` on the `PurchaseOrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `loyaltyPointsEarned` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `loyaltyPointsRedeemed` on the `Sale` table. All the data in the column will be lost.
  - You are about to alter the column `subtotal` on the `Sale` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `taxAmount` on the `Sale` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `discountAmount` on the `Sale` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `totalAmount` on the `Sale` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `unitPrice` on the `SaleItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `discountAmount` on the `SaleItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `taxAmount` on the `SaleItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `totalPrice` on the `SaleItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `attachments` on the `SupplierContract` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `destinationStoreId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `destinationWarehouseId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `receivedById` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `receivedDate` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `referenceNumber` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `shippedDate` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `sourceStoreId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `sourceWarehouseId` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Transfer` table. All the data in the column will be lost.
  - You are about to drop the column `approvedQuantity` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to drop the column `destinationCostPrice` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to drop the column `destinationInventoryId` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to drop the column `destinationRetailPrice` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to drop the column `destinationWholesalePrice` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to drop the column `receivedQuantity` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to drop the column `requestedQuantity` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to drop the column `shippedQuantity` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to drop the column `sourceInventoryId` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to drop the column `sourceWholesalePrice` on the `TransferItem` table. All the data in the column will be lost.
  - You are about to alter the column `sourceCostPrice` on the `TransferItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `sourceRetailPrice` on the `TransferItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the `CustomerAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerPromotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerToGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoyaltyProgramRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromotionRedemption` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId,storeId]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,warehouseId,binId]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transferNumber]` on the table `Transfer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `LoyaltyTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contractNumber` to the `SupplierContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `SupplierContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transferNumber` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transferType` to the `Transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `TransferItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetCostPrice` to the `TransferItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetRetailPrice` to the `TransferItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWAL_PENDING');

-- CreateEnum
CREATE TYPE "PerformanceMetricType" AS ENUM ('ON_TIME_DELIVERY', 'QUALITY', 'PRICE_COMPETITIVENESS', 'RESPONSIVENESS', 'LEAD_TIME');

-- CreateEnum
CREATE TYPE "InventoryMethod" AS ENUM ('FIFO', 'LIFO', 'FEFO', 'AVERAGE_COST');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundMethod" AS ENUM ('ORIGINAL_PAYMENT', 'STORE_CREDIT', 'CASH', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('DEFECTIVE', 'DAMAGED', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'OTHER');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('GOOD', 'DAMAGED', 'OPENED', 'USED');

-- CreateEnum
CREATE TYPE "QCType" AS ENUM ('RECEIVING', 'RETURN', 'RANDOM', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "QCStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QCItemStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'PARTIALLY_PASSED');

-- CreateEnum
CREATE TYPE "QCAction" AS ENUM ('ACCEPT', 'REJECT', 'REWORK', 'RETURN_TO_SUPPLIER', 'DISPOSE');

-- CreateEnum
CREATE TYPE "TransferPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'TRANSFER', 'ADJUSTMENT', 'SALE', 'RETURN', 'APPROVAL', 'REJECTION');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'DAMAGED');

-- AlterEnum
BEGIN;
CREATE TYPE "InventoryStatus_new" AS ENUM ('AVAILABLE', 'RESERVED', 'DAMAGED', 'EXPIRED', 'IN_TRANSIT', 'QUARANTINE', 'RETURNED');
ALTER TABLE "InventoryItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "InventoryItem" ALTER COLUMN "status" TYPE "InventoryStatus_new" USING ("status"::text::"InventoryStatus_new");
ALTER TYPE "InventoryStatus" RENAME TO "InventoryStatus_old";
ALTER TYPE "InventoryStatus_new" RENAME TO "InventoryStatus";
DROP TYPE "InventoryStatus_old";
ALTER TABLE "InventoryItem" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "LoyaltyTransactionType_new" AS ENUM ('EARN', 'REDEEM', 'ADJUSTMENT', 'EXPIRY');
ALTER TABLE "LoyaltyTransaction" ALTER COLUMN "type" TYPE "LoyaltyTransactionType_new" USING ("type"::text::"LoyaltyTransactionType_new");
ALTER TYPE "LoyaltyTransactionType" RENAME TO "LoyaltyTransactionType_old";
ALTER TYPE "LoyaltyTransactionType_new" RENAME TO "LoyaltyTransactionType";
DROP TYPE "LoyaltyTransactionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_PAYMENT', 'BANK_TRANSFER');
ALTER TABLE "Sale" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TABLE "Payment" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PurchaseOrderStatus_new" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');
ALTER TABLE "PurchaseOrder" ALTER COLUMN "status" TYPE "PurchaseOrderStatus_new" USING ("status"::text::"PurchaseOrderStatus_new");
ALTER TYPE "PurchaseOrderStatus" RENAME TO "PurchaseOrderStatus_old";
ALTER TYPE "PurchaseOrderStatus_new" RENAME TO "PurchaseOrderStatus";
DROP TYPE "PurchaseOrderStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransferStatus_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Transfer" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Transfer" ALTER COLUMN "status" TYPE "TransferStatus_new" USING ("status"::text::"TransferStatus_new");
ALTER TYPE "TransferStatus" RENAME TO "TransferStatus_old";
ALTER TYPE "TransferStatus_new" RENAME TO "TransferStatus";
DROP TYPE "TransferStatus_old";
ALTER TABLE "Transfer" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransferType_new" AS ENUM ('RESTOCK', 'RETURN', 'RELOCATION', 'ADJUSTMENT', 'INITIAL_STOCK');
ALTER TABLE "Transfer" ALTER COLUMN "transferType" TYPE "TransferType_new" USING ("transferType"::text::"TransferType_new");
ALTER TYPE "TransferType" RENAME TO "TransferType_old";
ALTER TYPE "TransferType_new" RENAME TO "TransferType";
DROP TYPE "TransferType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerAddress" DROP CONSTRAINT "CustomerAddress_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerNote" DROP CONSTRAINT "CustomerNote_createdById_fkey";

-- DropForeignKey
ALTER TABLE "CustomerNote" DROP CONSTRAINT "CustomerNote_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerPromotion" DROP CONSTRAINT "CustomerPromotion_programId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerToGroup" DROP CONSTRAINT "CustomerToGroup_customerId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerToGroup" DROP CONSTRAINT "CustomerToGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "LoyaltyProgramRule" DROP CONSTRAINT "LoyaltyProgramRule_programId_fkey";

-- DropForeignKey
ALTER TABLE "LoyaltyTransaction" DROP CONSTRAINT "LoyaltyTransaction_saleId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "PromotionRedemption" DROP CONSTRAINT "PromotionRedemption_customerId_fkey";

-- DropForeignKey
ALTER TABLE "PromotionRedemption" DROP CONSTRAINT "PromotionRedemption_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "PromotionRedemption" DROP CONSTRAINT "PromotionRedemption_saleId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_createdById_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_destinationStoreId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_destinationWarehouseId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_receivedById_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_sourceStoreId_fkey";

-- DropForeignKey
ALTER TABLE "Transfer" DROP CONSTRAINT "Transfer_sourceWarehouseId_fkey";

-- DropForeignKey
ALTER TABLE "TransferItem" DROP CONSTRAINT "TransferItem_destinationInventoryId_fkey";

-- DropForeignKey
ALTER TABLE "TransferItem" DROP CONSTRAINT "TransferItem_sourceInventoryId_fkey";

-- DropIndex
DROP INDEX "InventoryItem_productId_warehouseId_storeId_batchNumber_lot_key";

-- DropIndex
DROP INDEX "Transfer_referenceNumber_idx";

-- DropIndex
DROP INDEX "Transfer_referenceNumber_key";

-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "completedDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AuditAssignment" DROP COLUMN "assignedAisles",
DROP COLUMN "assignedBins",
DROP COLUMN "assignedShelves",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "AuditItem" DROP COLUMN "actualQuantity",
DROP COLUMN "variance",
ADD COLUMN     "countedAt" TIMESTAMP(3),
ADD COLUMN     "countedById" TEXT,
ADD COLUMN     "countedQuantity" INTEGER,
ADD COLUMN     "discrepancy" INTEGER;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "birthDate",
DROP COLUMN "gender",
DROP COLUMN "notes";

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "wholesalePrice",
ADD COLUMN     "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "inventoryMethod" "InventoryMethod",
ADD COLUMN     "manufacturingDate" TIMESTAMP(3),
ADD COLUMN     "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "costPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "retailPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "LoyaltyProgram" DROP COLUMN "minimumPurchase",
DROP COLUMN "pointsPerCurrency",
ADD COLUMN     "pointsPerDollar" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "LoyaltyProgramTier" ALTER COLUMN "pointsMultiplier" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "LoyaltyTransaction" DROP COLUMN "expiryDate",
DROP COLUMN "saleId",
ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "dimensions",
DROP COLUMN "maxStockLevel",
DROP COLUMN "taxRate",
DROP COLUMN "weight",
ADD COLUMN     "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "leadTime" INTEGER,
ALTER COLUMN "costPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "wholesalePrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "retailPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "createdById" DROP NOT NULL,
ALTER COLUMN "updatedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "deliveredDate",
DROP COLUMN "discount",
DROP COLUMN "shipping",
DROP COLUMN "tax",
DROP COLUMN "total",
DROP COLUMN "updatedById",
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "receivedById" TEXT,
ADD COLUMN     "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "subtotal" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "description",
DROP COLUMN "discount",
DROP COLUMN "orderedQuantity",
DROP COLUMN "subtotal",
DROP COLUMN "tax",
DROP COLUMN "total",
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "loyaltyPointsEarned",
DROP COLUMN "loyaltyPointsRedeemed",
ALTER COLUMN "subtotal" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discountAmount" SET DEFAULT 0,
ALTER COLUMN "discountAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SaleItem" ALTER COLUMN "unitPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discountAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "taxAmount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "rating" INTEGER,
ALTER COLUMN "createdById" DROP NOT NULL,
ALTER COLUMN "updatedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SupplierContract" DROP COLUMN "attachments",
ADD COLUMN     "contractNumber" TEXT NOT NULL,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "paymentTerms" TEXT,
ADD COLUMN     "renewalDate" TIMESTAMP(3),
ADD COLUMN     "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedById" TEXT,
ADD COLUMN     "value" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Transfer" DROP COLUMN "createdById",
DROP COLUMN "destinationStoreId",
DROP COLUMN "destinationWarehouseId",
DROP COLUMN "receivedById",
DROP COLUMN "receivedDate",
DROP COLUMN "referenceNumber",
DROP COLUMN "shippedDate",
DROP COLUMN "sourceStoreId",
DROP COLUMN "sourceWarehouseId",
DROP COLUMN "type",
ADD COLUMN     "actualDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "completedById" TEXT,
ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "expectedDeliveryDate" TIMESTAMP(3),
ADD COLUMN     "fromStoreId" TEXT,
ADD COLUMN     "fromWarehouseId" TEXT,
ADD COLUMN     "priority" "TransferPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "rejectedById" TEXT,
ADD COLUMN     "rejectedDate" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "requestedById" TEXT,
ADD COLUMN     "shippingMethod" TEXT,
ADD COLUMN     "toStoreId" TEXT,
ADD COLUMN     "toWarehouseId" TEXT,
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalItems" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRetail" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "transferNumber" TEXT NOT NULL,
ADD COLUMN     "transferType" "TransferType" NOT NULL,
ALTER COLUMN "requestedDate" DROP NOT NULL,
ALTER COLUMN "requestedDate" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TransferItem" DROP COLUMN "approvedQuantity",
DROP COLUMN "destinationCostPrice",
DROP COLUMN "destinationInventoryId",
DROP COLUMN "destinationRetailPrice",
DROP COLUMN "destinationWholesalePrice",
DROP COLUMN "receivedQuantity",
DROP COLUMN "requestedQuantity",
DROP COLUMN "shippedQuantity",
DROP COLUMN "sourceInventoryId",
DROP COLUMN "sourceWholesalePrice",
ADD COLUMN     "adjustmentReason" TEXT,
ADD COLUMN     "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "targetCostPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "targetRetailPrice" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "sourceCostPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "sourceRetailPrice" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "CustomerAddress";

-- DropTable
DROP TABLE "CustomerGroup";

-- DropTable
DROP TABLE "CustomerNote";

-- DropTable
DROP TABLE "CustomerPromotion";

-- DropTable
DROP TABLE "CustomerToGroup";

-- DropTable
DROP TABLE "LoyaltyProgramRule";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "PromotionRedemption";

-- DropEnum
DROP TYPE "AddressType";

-- DropEnum
DROP TYPE "LoyaltyRuleType";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "PromotionType";

-- CreateTable
CREATE TABLE "SupplierPerformanceMetric" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "metricType" "PerformanceMetricType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierPerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryPriceRule" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "adjustmentType" TEXT NOT NULL,
    "adjustmentValue" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryPriceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "processedById" TEXT NOT NULL,
    "processedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Return" (
    "id" TEXT NOT NULL,
    "returnNumber" TEXT NOT NULL,
    "saleId" TEXT,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "returnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "refundMethod" "RefundMethod",
    "refundStatus" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "notes" TEXT,
    "processedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnItem" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "saleItemId" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "reason" "ReturnReason" NOT NULL,
    "condition" "ItemCondition" NOT NULL DEFAULT 'GOOD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityControl" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "type" "QCType" NOT NULL,
    "status" "QCStatus" NOT NULL DEFAULT 'PENDING',
    "warehouseId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "returnId" TEXT,
    "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedDate" TIMESTAMP(3),
    "inspectedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityControl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityControlItem" (
    "id" TEXT NOT NULL,
    "qualityControlId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "passedQuantity" INTEGER NOT NULL DEFAULT 0,
    "failedQuantity" INTEGER NOT NULL DEFAULT 0,
    "pendingQuantity" INTEGER NOT NULL DEFAULT 0,
    "status" "QCItemStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "action" "QCAction",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityControlItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferDocument" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SHIPPING',
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Return_returnNumber_key" ON "Return"("returnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QualityControl_referenceNumber_key" ON "QualityControl"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_productId_storeId_key" ON "InventoryItem"("productId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_productId_warehouseId_binId_key" ON "InventoryItem"("productId", "warehouseId", "binId");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_transferNumber_key" ON "Transfer"("transferNumber");

-- AddForeignKey
ALTER TABLE "SupplierPerformanceMetric" ADD CONSTRAINT "SupplierPerformanceMetric_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPriceRule" ADD CONSTRAINT "CategoryPriceRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "Return"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES "SaleItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityControl" ADD CONSTRAINT "QualityControl_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityControl" ADD CONSTRAINT "QualityControl_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityControl" ADD CONSTRAINT "QualityControl_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "Return"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityControl" ADD CONSTRAINT "QualityControl_inspectedById_fkey" FOREIGN KEY ("inspectedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityControlItem" ADD CONSTRAINT "QualityControlItem_qualityControlId_fkey" FOREIGN KEY ("qualityControlId") REFERENCES "QualityControl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityControlItem" ADD CONSTRAINT "QualityControlItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromStoreId_fkey" FOREIGN KEY ("fromStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toStoreId_fkey" FOREIGN KEY ("toStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferDocument" ADD CONSTRAINT "TransferDocument_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
