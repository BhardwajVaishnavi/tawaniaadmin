import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InventoryFilters } from "../_components/inventory-filters";

export default async function WarehouseInventoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Parse search parameters
  const warehouseId = searchParams.warehouse as string | undefined;
  const categoryId = searchParams.category as string | undefined;
  const search = searchParams.search as string | undefined;
  const filter = searchParams.filter as string | undefined;
  const page = parseInt(searchParams.page as string || "1");
  const pageSize = 10;

  // Build query filters
  const filters: any = {
    warehouseId: warehouseId ? warehouseId : undefined,
    product: {
      categoryId: categoryId ? categoryId : undefined,
      name: search ? { contains: search, mode: 'insensitive' } : undefined,
    },
    quantity: {
      gt: 0,
    },
  };

  // Add low stock filter if specified
  if (filter === "lowStock") {
    filters.quantity = {
      lt: prisma.product.fields.reorderPoint,
    };
  }

  // Get inventory items with pagination
  const [inventoryItems, totalItems, warehouses, categories] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: filters,
      include: {
        product: {
          include: {
            category: true,
          },
        },
        warehouse: true,
        bin: {
          include: {
            shelf: {
              include: {
                aisle: {
                  include: {
                    zone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { warehouse: { name: 'asc' } },
        { product: { name: 'asc' } },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.inventoryItem.count({
      where: filters,
    }),
    prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Warehouse Inventory</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/inventory/warehouse/adjust"
            className="rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
          >
            Adjust Inventory
          </Link>
          <Link
            href="/inventory/warehouse/count"
            className="rounded-md bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200 transition-colors"
          >
            Inventory Count
          </Link>
        </div>
      </div>

      <InventoryFilters
        warehouses={warehouses}
        categories={categories}
        currentWarehouseId={warehouseId}
        currentCategoryId={categoryId}
        currentSearch={search}
        currentFilter={filter}
      />

      <div className="rounded-lg bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-800">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Warehouse</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Min Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item) => {
                  // Calculate stock status
                  let stockStatus = "Normal";
                  let statusColor = "bg-green-100 text-green-800";

                  if (item.quantity <= 0) {
                    stockStatus = "Out of Stock";
                    statusColor = "bg-red-100 text-red-800";
                  } else if (item.quantity < item.product.reorderPoint) {
                    stockStatus = "Low Stock";
                    statusColor = "bg-yellow-100 text-yellow-800";
                  } else if (item.quantity < item.product.minStockLevel) {
                    stockStatus = "Below Min";
                    statusColor = "bg-orange-100 text-orange-800";
                  }

                  // Format location
                  const location = item.bin
                    ? `${item.bin.shelf.aisle.zone.code}-${item.bin.shelf.aisle.code}-${item.bin.shelf.code}-${item.bin.code}`
                    : "Not Assigned";

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">
                        <Link href={`/products/${item.product.id}`}>
                          {item.product.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                        {item.product.sku}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                        {item.product.category?.name || "Uncategorized"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                        {item.warehouse?.name || "Unknown"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                        {location}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                        {item.product.minStockLevel}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}>
                          {stockStatus}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/inventory/warehouse/history/${item.id}`}
                            className="rounded bg-blue-50 p-1 text-blue-600 hover:bg-blue-100"
                            title="View History"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/inventory/warehouse/adjust/${item.id}`}
                            className="rounded bg-green-50 p-1 text-green-600 hover:bg-green-100"
                            title="Adjust Inventory"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                          </Link>
                          <Link
                            href={`/inventory/warehouse/move/${item.id}`}
                            className="rounded bg-purple-50 p-1 text-purple-600 hover:bg-purple-100"
                            title="Move Inventory"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-800">
                    No inventory items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Link
                href={{
                  pathname: '/inventory/warehouse',
                  query: {
                    ...searchParams,
                    page: page > 1 ? page - 1 : 1,
                  },
                }}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 ${page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </Link>
              <Link
                href={{
                  pathname: '/inventory/warehouse',
                  query: {
                    ...searchParams,
                    page: page < totalPages ? page + 1 : totalPages,
                  },
                }}
                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </Link>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-800">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Link
                    href={{
                      pathname: '/inventory/warehouse',
                      query: {
                        ...searchParams,
                        page: page > 1 ? page - 1 : 1,
                      },
                    }}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-800 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Link
                        key={pageNum}
                        href={{
                          pathname: '/inventory/warehouse',
                          query: {
                            ...searchParams,
                            page: pageNum,
                          },
                        }}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          pageNum === page
                            ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                  <Link
                    href={{
                      pathname: '/inventory/warehouse',
                      query: {
                        ...searchParams,
                        page: page < totalPages ? page + 1 : totalPages,
                      },
                    }}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-800 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

