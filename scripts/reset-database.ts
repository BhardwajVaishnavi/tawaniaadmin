import { clearDatabase } from './clear-database';
import { seedFreshData } from './seed-fresh-data';

async function resetDatabase() {
  console.log('🔄 Starting complete database reset...');
  console.log('');

  try {
    // Step 1: Clear all existing data
    console.log('🗑️  STEP 1: Clearing existing data...');
    await clearDatabase();
    console.log('✅ Database cleared successfully!');
    console.log('');

    // Step 2: Seed fresh data
    console.log('🌱 STEP 2: Seeding fresh data...');
    await seedFreshData();
    console.log('✅ Fresh data seeded successfully!');
    console.log('');

    console.log('🎉 DATABASE RESET COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('✅ All old data removed');
    console.log('✅ Fresh Indian data seeded');
    console.log('✅ Users, warehouses, stores, products, inventory, and customers created');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('👤 Admin: admin@tawania.com / admin123');
    console.log('👤 Manager: manager@tawania.com / manager123');
    console.log('👤 Staff: staff@tawania.com / staff123');
    console.log('');
    console.log('🏪 STORES CREATED:');
    console.log('• Tawania Smart Bazar - Connaught Place');
    console.log('• Tawania Smart Bazar - Karol Bagh');
    console.log('• Tawania Smart Bazar - Lajpat Nagar');
    console.log('');
    console.log('🏭 WAREHOUSE CREATED:');
    console.log('• Tawania Main Warehouse (Gurugram)');
    console.log('');
    console.log('📱 PRODUCTS CREATED:');
    console.log('• Electronics: Samsung Galaxy S24, Galaxy Book, Galaxy Buds Pro 2');
    console.log('• Grocery: Patanjali Rice, Mustard Oil, Honey');
    console.log('• Clothing: Raymond Shirt, Formal Trouser');
    console.log('');
    console.log('📦 INVENTORY STOCKED:');
    console.log('• Warehouse inventory with proper bin locations');
    console.log('• Store inventory ready for POS sales');
    console.log('');
    console.log('👥 CUSTOMERS CREATED:');
    console.log('• 3 customers with loyalty points and Indian addresses');
    console.log('');
    console.log('🚀 Your Tawania Warehouse Management System is ready!');

  } catch (error) {
    console.error('💥 Database reset failed:', error);
    throw error;
  }
}

if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('');
      console.log('🎊 Database reset completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('');
      console.error('❌ Database reset failed:', error);
      process.exit(1);
    });
}

export { resetDatabase };
