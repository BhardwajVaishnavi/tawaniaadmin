import { prisma } from '@/lib/prisma';

export interface Store {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  openingHours?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreWithStats extends Store {
  inventoryCount: number;
  staffCount: number;
}

export async function getStores(options?: {
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  stores: StoreWithStats[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const {
    isActive,
    search,
    page = 1,
    pageSize = 10,
  } = options || {};

  // Build filters
  const filters: any = {};
  
  if (isActive !== undefined) {
    filters.isActive = isActive;
  }
  
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  // Get stores with pagination
  const [stores, totalItems] = await Promise.all([
    prisma.store.findMany({
      where: filters,
      include: {
        inventoryItems: {
          select: {
            id: true,
          },
        },
        staff: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.store.count({
      where: filters,
    }),
  ]);
  
  // Add inventory count to each store
  const storesWithStats = stores.map(store => {
    return {
      ...store,
      inventoryCount: store.inventoryItems.length,
      staffCount: store.staff.length,
    };
  });
  
  return {
    stores: storesWithStats,
    totalItems,
    page,
    pageSize,
    totalPages: Math.ceil(totalItems / pageSize),
  };
}

export async function getStoreById(id: string) {
  const store = await prisma.store.findUnique({
    where: {
      id,
    },
    include: {
      staff: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      inventoryItems: {
        include: {
          product: true,
        },
        take: 10,
      },
      sales: {
        include: {
          customer: true,
          createdBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });
  
  if (!store) {
    return null;
  }
  
  // Get additional statistics
  const [totalInventoryItems, totalSales, totalRevenue] = await Promise.all([
    prisma.inventoryItem.count({
      where: {
        storeId: store.id,
      },
    }),
    prisma.sale.count({
      where: {
        storeId: store.id,
      },
    }),
    prisma.sale.aggregate({
      where: {
        storeId: store.id,
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);
  
  return {
    store,
    stats: {
      totalInventoryItems,
      totalSales,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    }
  };
}

export async function createStore(data: {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  isActive?: boolean;
}) {
  const { name, code, address, phone, email, openingHours, isActive } = data;
  
  // Check if code already exists
  const existingStore = await prisma.store.findUnique({
    where: { code },
  });
  
  if (existingStore) {
    throw new Error("Store code already exists");
  }
  
  // Create store
  const store = await prisma.store.create({
    data: {
      name,
      code,
      address,
      phone,
      email,
      openingHours,
      isActive: isActive !== undefined ? isActive : true,
    },
  });
  
  return store;
}

export async function updateStore(id: string, data: {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  isActive?: boolean;
}) {
  const { name, code, address, phone, email, openingHours, isActive } = data;
  
  // Check if store exists
  const existingStore = await prisma.store.findUnique({
    where: {
      id,
    },
  });
  
  if (!existingStore) {
    throw new Error("Store not found");
  }
  
  // Check if code is unique if changed
  if (code && code !== existingStore.code) {
    const storeWithCode = await prisma.store.findUnique({
      where: { code },
    });
    
    if (storeWithCode) {
      throw new Error("Store code already in use");
    }
  }
  
  // Update store
  const updatedStore = await prisma.store.update({
    where: {
      id,
    },
    data: {
      name: name !== undefined ? name : undefined,
      code: code !== undefined ? code : undefined,
      address: address !== undefined ? address : undefined,
      phone: phone !== undefined ? phone : undefined,
      email: email !== undefined ? email : undefined,
      openingHours: openingHours !== undefined ? openingHours : undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    },
  });
  
  return updatedStore;
}

export async function deleteStore(id: string): Promise<{ deactivated: boolean }> {
  // Check if store exists
  const existingStore = await prisma.store.findUnique({
    where: {
      id,
    },
    include: {
      inventoryItems: {
        select: {
          id: true,
        },
      },
      staff: {
        select: {
          id: true,
        },
      },
      sales: {
        select: {
          id: true,
        },
      },
      returns: {
        select: {
          id: true,
        },
      },
      transfersFrom: {
        select: {
          id: true,
        },
      },
      transfersTo: {
        select: {
          id: true,
        },
      },
    },
  });
  
  if (!existingStore) {
    throw new Error("Store not found");
  }
  
  // Check if store has related records
  const hasRelatedRecords = 
    existingStore.inventoryItems.length > 0 ||
    existingStore.staff.length > 0 ||
    existingStore.sales.length > 0 ||
    existingStore.returns.length > 0 ||
    existingStore.transfersFrom.length > 0 ||
    existingStore.transfersTo.length > 0;
  
  if (hasRelatedRecords) {
    // Instead of deleting, mark as inactive
    await prisma.store.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
    
    return { deactivated: true };
  }
  
  // Delete store
  await prisma.store.delete({
    where: {
      id,
    },
  });
  
  return { deactivated: false };
}

export async function getStoreInventory(storeId: string, options?: {
  categoryId?: string;
  search?: string;
  filter?: string;
  page?: number;
  pageSize?: number;
}) {
  const {
    categoryId,
    search,
    filter,
    page = 1,
    pageSize = 10,
  } = options || {};
  
  // Build filters
  const filters: any = {
    storeId,
    product: {
      categoryId: categoryId ? categoryId : undefined,
      name: search ? { contains: search, mode: 'insensitive' } : undefined,
    },
  };
  
  // Add stock level filters
  if (filter === "lowStock") {
    filters.quantity = {
      gt: 0,
      lt: {
        path: ["product", "reorderPoint"],
      },
    };
  } else if (filter === "outOfStock") {
    filters.quantity = {
      lte: 0,
    };
  } else {
    filters.quantity = {
      gt: 0,
    };
  }
  
  // Get inventory items with pagination
  const [inventoryItems, totalItems] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: filters,
      include: {
        product: {
          include: {
            category: true,
          },
        },
        store: true,
      },
      orderBy: [
        { product: { name: 'asc' } },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inventoryItem.count({
      where: filters,
    }),
  ]);
  
  return {
    inventoryItems,
    totalItems,
    page,
    pageSize,
    totalPages: Math.ceil(totalItems / pageSize),
  };
}

export async function adjustStoreInventory(storeId: string, data: {
  productId: string;
  adjustmentType: 'add' | 'remove' | 'set';
  quantity: number;
  reason: string;
  notes?: string;
  userId: string;
}) {
  const { productId, adjustmentType, quantity, reason, notes, userId } = data;
  
  // Check if store exists
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });
  
  if (!store) {
    throw new Error("Store not found");
  }
  
  // Check if inventory item exists
  const inventoryItem = await prisma.inventoryItem.findFirst({
    where: {
      productId,
      storeId,
    },
  });
  
  if (!inventoryItem) {
    throw new Error("Inventory item not found");
  }
  
  // Calculate new quantity based on adjustment type
  let newQuantity = inventoryItem.quantity;
  
  if (adjustmentType === "add") {
    newQuantity += quantity;
  } else if (adjustmentType === "remove") {
    newQuantity = Math.max(0, newQuantity - quantity);
  } else if (adjustmentType === "set") {
    newQuantity = quantity;
  } else {
    throw new Error("Invalid adjustment type");
  }
  
  // Update inventory item
  const updatedInventoryItem = await prisma.inventoryItem.update({
    where: {
      id: inventoryItem.id,
    },
    data: {
      quantity: newQuantity,
      status: newQuantity > 0 ? "AVAILABLE" : "OUT_OF_STOCK",
    },
  });
  
  // Create inventory transaction record if the model exists
  try {
    const inventoryTransaction = await prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: inventoryItem.id,
        transactionType: adjustmentType.toUpperCase(),
        quantity,
        previousQuantity: inventoryItem.quantity,
        newQuantity,
        reason: reason.toUpperCase(),
        notes,
        createdById: userId,
      },
    });
    
    return {
      inventoryItem: updatedInventoryItem,
      transaction: inventoryTransaction,
    };
  } catch (error) {
    // If InventoryTransaction model doesn't exist, just return the updated item
    return {
      inventoryItem: updatedInventoryItem,
    };
  }
}
