import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️  Starting database cleanup...');

  try {
    // Delete in reverse order of dependencies to avoid foreign key constraints
    console.log('Deleting dependent records...');
    
    // Delete all transaction-related records first
    await prisma.loyaltyTransaction.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.returnItem.deleteMany();
    await prisma.return.deleteMany();
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    
    // Delete transfer-related records
    await prisma.transferDocument.deleteMany();
    await prisma.transferItem.deleteMany();
    await prisma.transfer.deleteMany();
    
    // Delete audit-related records
    await prisma.auditItem.deleteMany();
    await prisma.auditAssignment.deleteMany();
    await prisma.audit.deleteMany();
    
    // Delete quality control records
    await prisma.qualityControlItem.deleteMany();
    await prisma.qualityControl.deleteMany();
    
    // Delete purchase order records
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    
    // Delete inventory and warehouse movement records
    await prisma.warehouseMovementItem.deleteMany();
    await prisma.warehouseMovement.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.stockStatus.deleteMany();
    
    // Delete warehouse structure
    await prisma.warehouseBin.deleteMany();
    await prisma.warehouseShelf.deleteMany();
    await prisma.warehouseAisle.deleteMany();
    await prisma.warehouseZone.deleteMany();
    
    // Delete staff assignments
    await prisma.warehouseStaff.deleteMany();
    await prisma.storeStaff.deleteMany();
    
    // Delete products and categories
    await prisma.product.deleteMany();
    await prisma.categoryPriceRule.deleteMany();
    await prisma.category.deleteMany();
    
    // Delete supplier-related records
    await prisma.supplierPerformanceMetric.deleteMany();
    await prisma.supplierContract.deleteMany();
    await prisma.supplier.deleteMany();
    
    // Delete customer-related records
    await prisma.customerAddress.deleteMany();
    await prisma.address.deleteMany();
    await prisma.customer.deleteMany();
    
    // Delete loyalty program records
    await prisma.loyaltyProgramTier.deleteMany();
    await prisma.loyaltyProgram.deleteMany();
    
    // Delete locations
    await prisma.store.deleteMany();
    await prisma.warehouse.deleteMany();
    
    // Delete auth-related records
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verificationToken.deleteMany();
    
    // Finally delete users
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  clearDatabase()
    .then(() => {
      console.log('🎉 Database cleanup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database cleanup failed:', error);
      process.exit(1);
    });
}

export { clearDatabase };
