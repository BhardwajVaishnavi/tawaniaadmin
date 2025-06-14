import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedFreshData() {
  console.log('🌱 Starting fresh data seeding...');

  try {
    // 1. Create Users
    console.log('👥 Creating users...');
    const adminUser = await prisma.user.create({
      data: {
        name: 'Rajesh Kumar',
        email: 'admin@tawania.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        isActive: true,
      },
    });

    const managerUser = await prisma.user.create({
      data: {
        name: 'Priya Sharma',
        email: 'manager@tawania.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'MANAGER',
        isActive: true,
      },
    });

    const staffUser = await prisma.user.create({
      data: {
        name: 'Amit Singh',
        email: 'staff@tawania.com',
        password: await bcrypt.hash('staff123', 10),
        role: 'STAFF',
        isActive: true,
      },
    });

    // 2. Create Warehouse
    console.log('🏭 Creating warehouse...');
    const warehouse = await prisma.warehouse.create({
      data: {
        name: 'Tawania Main Warehouse',
        code: 'TMW001',
        address: 'Plot No. 123, Industrial Area, Sector 58, Gurugram, Haryana 122001',
        contactPerson: 'Rajesh Kumar',
        phone: '+91-9876543210',
        email: 'warehouse@tawania.com',
        isActive: true,
      },
    });

    // 3. Create Warehouse Zones and Structure
    console.log('🏗️ Creating warehouse structure...');
    const zone1 = await prisma.warehouseZone.create({
      data: {
        name: 'Electronics Zone',
        code: 'EZ01',
        warehouseId: warehouse.id,
        description: 'Zone for electronic products',
      },
    });

    const zone2 = await prisma.warehouseZone.create({
      data: {
        name: 'Grocery Zone',
        code: 'GZ01',
        warehouseId: warehouse.id,
        description: 'Zone for grocery items',
      },
    });

    const aisle1 = await prisma.warehouseAisle.create({
      data: {
        name: 'Electronics Aisle A',
        code: 'EA01',
        zoneId: zone1.id,
      },
    });

    const aisle2 = await prisma.warehouseAisle.create({
      data: {
        name: 'Grocery Aisle A',
        code: 'GA01',
        zoneId: zone2.id,
      },
    });

    const shelf1 = await prisma.warehouseShelf.create({
      data: {
        name: 'Electronics Shelf 1',
        code: 'ES01',
        aisleId: aisle1.id,
      },
    });

    const shelf2 = await prisma.warehouseShelf.create({
      data: {
        name: 'Grocery Shelf 1',
        code: 'GS01',
        aisleId: aisle2.id,
      },
    });

    const bin1 = await prisma.warehouseBin.create({
      data: {
        name: 'Electronics Bin 1',
        code: 'EB01',
        shelfId: shelf1.id,
        capacity: 100,
      },
    });

    const bin2 = await prisma.warehouseBin.create({
      data: {
        name: 'Grocery Bin 1',
        code: 'GB01',
        shelfId: shelf2.id,
        capacity: 200,
      },
    });

    // 4. Create Stores
    console.log('🏪 Creating stores...');
    const store1 = await prisma.store.create({
      data: {
        name: 'Tawania Smart Bazar - Connaught Place',
        code: 'TSB001',
        address: 'Shop No. 45, Connaught Place, New Delhi 110001',
        phone: '+91-9876543211',
        email: 'cp@tawania.com',
        openingHours: '9:00 AM - 10:00 PM',
        isActive: true,
      },
    });

    const store2 = await prisma.store.create({
      data: {
        name: 'Tawania Smart Bazar - Karol Bagh',
        code: 'TSB002',
        address: 'Shop No. 78, Karol Bagh Market, New Delhi 110005',
        phone: '+91-9876543212',
        email: 'kb@tawania.com',
        openingHours: '9:00 AM - 10:00 PM',
        isActive: true,
      },
    });

    const store3 = await prisma.store.create({
      data: {
        name: 'Tawania Smart Bazar - Lajpat Nagar',
        code: 'TSB003',
        address: 'Shop No. 23, Lajpat Nagar Central Market, New Delhi 110024',
        phone: '+91-9876543213',
        email: 'ln@tawania.com',
        openingHours: '9:00 AM - 10:00 PM',
        isActive: true,
      },
    });

    // 5. Create Categories
    console.log('📂 Creating categories...');
    const electronicsCategory = await prisma.category.create({
      data: {
        name: 'Electronics',
        code: 'ELEC',
        description: 'Electronic devices and accessories',
        isActive: true,
      },
    });

    const groceryCategory = await prisma.category.create({
      data: {
        name: 'Grocery',
        code: 'GROC',
        description: 'Food and grocery items',
        isActive: true,
      },
    });

    const clothingCategory = await prisma.category.create({
      data: {
        name: 'Clothing',
        code: 'CLTH',
        description: 'Clothing and fashion items',
        isActive: true,
      },
    });

    const homeCategory = await prisma.category.create({
      data: {
        name: 'Home & Kitchen',
        code: 'HOME',
        description: 'Home and kitchen appliances',
        isActive: true,
      },
    });

    // 6. Create Suppliers
    console.log('🏭 Creating suppliers...');
    const supplier1 = await prisma.supplier.create({
      data: {
        name: 'Samsung India Electronics Pvt Ltd',
        contactPerson: 'Vikram Patel',
        email: 'orders@samsung.in',
        phone: '+91-9876543220',
        address: 'Samsung Plaza, Sector 15, Gurugram, Haryana 122001',
        city: 'Gurugram',
        state: 'Haryana',
        postalCode: '122001',
        country: 'India',
        taxId: 'GSTIN123456789',
        paymentTerms: 'Net 30',
        rating: 5,
        isActive: true,
      },
    });

    const supplier2 = await prisma.supplier.create({
      data: {
        name: 'Patanjali Ayurved Limited',
        contactPerson: 'Ramesh Gupta',
        email: 'orders@patanjali.co.in',
        phone: '+91-9876543221',
        address: 'Patanjali Food & Herbal Park, Haridwar, Uttarakhand 249401',
        city: 'Haridwar',
        state: 'Uttarakhand',
        postalCode: '249401',
        country: 'India',
        taxId: 'GSTIN987654321',
        paymentTerms: 'Net 15',
        rating: 4,
        isActive: true,
      },
    });

    const supplier3 = await prisma.supplier.create({
      data: {
        name: 'Raymond Limited',
        contactPerson: 'Suresh Agarwal',
        email: 'orders@raymond.in',
        phone: '+91-9876543222',
        address: 'Raymond House, Plot No. 301, Thane-Belapur Road, Thane 400607',
        city: 'Thane',
        state: 'Maharashtra',
        postalCode: '400607',
        country: 'India',
        taxId: 'GSTIN456789123',
        paymentTerms: 'Net 45',
        rating: 4,
        isActive: true,
      },
    });

    // 7. Create Products
    console.log('📱 Creating products...');

    // Electronics Products
    const smartphone = await prisma.product.create({
      data: {
        sku: 'SAM-GAL-S24-128',
        barcode: '8801643740825',
        name: 'Samsung Galaxy S24 128GB',
        description: 'Latest Samsung Galaxy S24 smartphone with 128GB storage',
        unit: 'piece',
        categoryId: electronicsCategory.id,
        supplierId: supplier1.id,
        costPrice: 45000,
        wholesalePrice: 55000,
        retailPrice: 65000,
        minStockLevel: 5,
        reorderPoint: 10,
        leadTime: 7,
        condition: 'NEW',
        isActive: true,
      },
    });

    const laptop = await prisma.product.create({
      data: {
        sku: 'SAM-BOOK-15-512',
        barcode: '8801643740826',
        name: 'Samsung Galaxy Book 15" 512GB',
        description: 'Samsung Galaxy Book laptop with 15" display and 512GB SSD',
        unit: 'piece',
        categoryId: electronicsCategory.id,
        supplierId: supplier1.id,
        costPrice: 75000,
        wholesalePrice: 85000,
        retailPrice: 95000,
        minStockLevel: 3,
        reorderPoint: 5,
        leadTime: 10,
        condition: 'NEW',
        isActive: true,
      },
    });

    const earbuds = await prisma.product.create({
      data: {
        sku: 'SAM-BUDS-PRO-2',
        barcode: '8801643740827',
        name: 'Samsung Galaxy Buds Pro 2',
        description: 'Premium wireless earbuds with noise cancellation',
        unit: 'piece',
        categoryId: electronicsCategory.id,
        supplierId: supplier1.id,
        costPrice: 8000,
        wholesalePrice: 10000,
        retailPrice: 12000,
        minStockLevel: 10,
        reorderPoint: 20,
        leadTime: 5,
        condition: 'NEW',
        isActive: true,
      },
    });

    // Grocery Products
    const rice = await prisma.product.create({
      data: {
        sku: 'PAT-RICE-BAM-5KG',
        barcode: '8904109400123',
        name: 'Patanjali Basmati Rice 5KG',
        description: 'Premium quality basmati rice from Patanjali',
        unit: 'kg',
        categoryId: groceryCategory.id,
        supplierId: supplier2.id,
        costPrice: 400,
        wholesalePrice: 500,
        retailPrice: 600,
        minStockLevel: 50,
        reorderPoint: 100,
        leadTime: 3,
        condition: 'NEW',
        isActive: true,
      },
    });

    const oil = await prisma.product.create({
      data: {
        sku: 'PAT-OIL-MUS-1L',
        barcode: '8904109400124',
        name: 'Patanjali Mustard Oil 1L',
        description: 'Pure mustard oil for cooking',
        unit: 'liter',
        categoryId: groceryCategory.id,
        supplierId: supplier2.id,
        costPrice: 150,
        wholesalePrice: 180,
        retailPrice: 220,
        minStockLevel: 30,
        reorderPoint: 60,
        leadTime: 2,
        condition: 'NEW',
        isActive: true,
      },
    });

    const honey = await prisma.product.create({
      data: {
        sku: 'PAT-HON-PUR-500G',
        barcode: '8904109400125',
        name: 'Patanjali Pure Honey 500G',
        description: 'Natural pure honey from Patanjali',
        unit: 'gram',
        categoryId: groceryCategory.id,
        supplierId: supplier2.id,
        costPrice: 200,
        wholesalePrice: 250,
        retailPrice: 300,
        minStockLevel: 25,
        reorderPoint: 50,
        leadTime: 3,
        condition: 'NEW',
        isActive: true,
      },
    });

    // Clothing Products
    const shirt = await prisma.product.create({
      data: {
        sku: 'RAY-SHT-COT-L',
        barcode: '8901030400123',
        name: 'Raymond Cotton Shirt - Large',
        description: 'Premium cotton formal shirt from Raymond',
        unit: 'piece',
        categoryId: clothingCategory.id,
        supplierId: supplier3.id,
        costPrice: 1200,
        wholesalePrice: 1500,
        retailPrice: 1800,
        minStockLevel: 15,
        reorderPoint: 30,
        leadTime: 14,
        condition: 'NEW',
        isActive: true,
      },
    });

    const trouser = await prisma.product.create({
      data: {
        sku: 'RAY-TRS-FOR-32',
        barcode: '8901030400124',
        name: 'Raymond Formal Trouser - 32',
        description: 'Premium formal trouser from Raymond',
        unit: 'piece',
        categoryId: clothingCategory.id,
        supplierId: supplier3.id,
        costPrice: 1800,
        wholesalePrice: 2200,
        retailPrice: 2600,
        minStockLevel: 10,
        reorderPoint: 20,
        leadTime: 14,
        condition: 'NEW',
        isActive: true,
      },
    });

    // 8. Create Inventory Items
    console.log('📦 Creating inventory items...');

    // Warehouse Inventory
    await prisma.inventoryItem.create({
      data: {
        productId: smartphone.id,
        warehouseId: warehouse.id,
        binId: bin1.id,
        batchNumber: 'BATCH001',
        quantity: 50,
        costPrice: 45000,
        retailPrice: 65000,
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    });

    await prisma.inventoryItem.create({
      data: {
        productId: laptop.id,
        warehouseId: warehouse.id,
        binId: bin1.id,
        batchNumber: 'BATCH002',
        quantity: 20,
        costPrice: 75000,
        retailPrice: 95000,
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    });

    await prisma.inventoryItem.create({
      data: {
        productId: rice.id,
        warehouseId: warehouse.id,
        binId: bin2.id,
        batchNumber: 'BATCH003',
        quantity: 200,
        costPrice: 400,
        retailPrice: 600,
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    });

    // Store Inventory
    await prisma.inventoryItem.create({
      data: {
        productId: smartphone.id,
        storeId: store1.id,
        quantity: 15,
        costPrice: 45000,
        retailPrice: 65000,
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    });

    await prisma.inventoryItem.create({
      data: {
        productId: earbuds.id,
        storeId: store1.id,
        quantity: 25,
        costPrice: 8000,
        retailPrice: 12000,
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    });

    await prisma.inventoryItem.create({
      data: {
        productId: rice.id,
        storeId: store1.id,
        quantity: 50,
        costPrice: 400,
        retailPrice: 600,
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    });

    await prisma.inventoryItem.create({
      data: {
        productId: oil.id,
        storeId: store1.id,
        quantity: 30,
        costPrice: 150,
        retailPrice: 220,
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    });

    await prisma.inventoryItem.create({
      data: {
        productId: shirt.id,
        storeId: store2.id,
        quantity: 20,
        costPrice: 1200,
        retailPrice: 1800,
        status: 'AVAILABLE',
        condition: 'NEW',
      },
    });

    // 9. Create Customers
    console.log('👥 Creating customers...');
    await prisma.customer.create({
      data: {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@gmail.com',
        phone: '+91-9876543230',
        address: 'A-123, Sector 15, Noida, UP 201301',
        loyaltyPoints: 150,
        loyaltyTier: 'SILVER',
        isActive: true,
      },
    });

    await prisma.customer.create({
      data: {
        name: 'Sneha Patel',
        email: 'sneha.patel@gmail.com',
        phone: '+91-9876543231',
        address: 'B-456, Vasant Kunj, New Delhi 110070',
        loyaltyPoints: 300,
        loyaltyTier: 'GOLD',
        isActive: true,
      },
    });

    await prisma.customer.create({
      data: {
        name: 'Rohit Sharma',
        email: 'rohit.sharma@gmail.com',
        phone: '+91-9876543232',
        address: 'C-789, Dwarka Sector 10, New Delhi 110075',
        loyaltyPoints: 75,
        loyaltyTier: 'STANDARD',
        isActive: true,
      },
    });

    console.log('✅ Fresh data seeding completed successfully!');
    console.log(`👤 Admin User: admin@tawania.com / admin123`);
    console.log(`👤 Manager User: manager@tawania.com / manager123`);
    console.log(`👤 Staff User: staff@tawania.com / staff123`);
    console.log(`🏪 Stores: ${store1.name}, ${store2.name}, ${store3.name}`);
    console.log(`🏭 Warehouse: ${warehouse.name}`);
    console.log(`📱 Products: 8 products created across 4 categories`);
    console.log(`📦 Inventory: Items stocked in warehouse and stores`);
    console.log(`👥 Customers: 3 customers created with loyalty points`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedFreshData()
    .then(() => {
      console.log('🎉 Fresh data seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fresh data seeding failed:', error);
      process.exit(1);
    });
}

export { seedFreshData };
