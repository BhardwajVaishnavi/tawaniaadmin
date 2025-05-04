import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CustomerStatusBadge } from "../_components/customer-status-badge";
import { LoyaltyTierBadge } from "../_components/loyalty-tier-badge";
import { CustomerActions } from "../_components/customer-actions";
import { LoyaltyTransactionsList } from "../_components/loyalty-transactions-list";
import { CustomerAddressList } from "../_components/customer-address-list";
import { CustomerNotesList } from "../_components/customer-notes-list";
import { CustomerSalesList } from "../_components/customer-sales-list";

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  // Get customer details
  const customer = await prisma.customer.findUnique({
    where: {
      id: params.id,
    },
    include: {
      sales: {
        include: {
          store: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          saleDate: "desc",
        },
      },
      addresses: {
        orderBy: {
          isDefault: "desc",
        },
      },
      customerNotes: {
        include: {
          createdBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      loyaltyTransactions: {
        include: {
          program: true,
          sale: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      groups: {
        include: {
          group: true,
        },
      },
      promotionRedemptions: {
        include: {
          promotion: true,
          sale: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  
  if (!customer) {
    notFound();
  }
  
  // Calculate customer statistics
  const totalSpent = customer.sales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount),
    0
  );
  
  const totalOrders = customer.sales.length;
  
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  
  // Get loyalty program data
  const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
    where: {
      isActive: true,
    },
    include: {
      tiers: {
        orderBy: {
          requiredPoints: "asc",
        },
      },
    },
  });
  
  // Calculate next tier
  let nextTier = null;
  let pointsToNextTier = 0;
  
  if (loyaltyProgram) {
    const currentTierIndex = loyaltyProgram.tiers.findIndex(
      (tier) => tier.name.toUpperCase() === customer.loyaltyTier
    );
    
    if (currentTierIndex >= 0 && currentTierIndex < loyaltyProgram.tiers.length - 1) {
      nextTier = loyaltyProgram.tiers[currentTierIndex + 1];
      pointsToNextTier = nextTier.requiredPoints - customer.loyaltyPoints;
    }
  }
  
  // Get available promotions
  const availablePromotions = await prisma.customerPromotion.findMany({
    where: {
      isActive: true,
      endDate: {
        gte: new Date(),
      },
      OR: [
        { requiredLoyaltyTier: null },
        { requiredLoyaltyTier: customer.loyaltyTier },
      ],
    },
    orderBy: {
      startDate: "asc",
    },
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{customer.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <CustomerStatusBadge isActive={customer.isActive} />
            <LoyaltyTierBadge tier={customer.loyaltyTier} />
            <span className="text-sm text-gray-500">
              Customer since {format(new Date(customer.createdAt), "MMMM d, yyyy")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CustomerActions customer={customer} />
          <Link
            href="/customers"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Back to Customers
          </Link>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Customer Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{customer.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{customer.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Birth Date</p>
                <p className="font-medium">
                  {customer.birthDate
                    ? format(new Date(customer.birthDate), "MMMM d, yyyy")
                    : "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{customer.gender || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <CustomerStatusBadge isActive={customer.isActive} />
              </div>
            </div>
          </div>
          
          {/* Loyalty Information */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Loyalty Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Loyalty Tier</p>
                <div className="flex items-center gap-2">
                  <LoyaltyTierBadge tier={customer.loyaltyTier} />
                  {nextTier && (
                    <span className="text-xs text-gray-500">
                      {pointsToNextTier > 0
                        ? `${pointsToNextTier} points to ${nextTier.name}`
                        : `Eligible for ${nextTier.name}`}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loyalty Points</p>
                <p className="font-medium">{customer.loyaltyPoints}</p>
              </div>
            </div>
            
            {loyaltyProgram && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Progress to Next Tier</p>
                  {nextTier && (
                    <p className="text-xs text-gray-500">
                      {customer.loyaltyPoints} / {nextTier.requiredPoints} points
                    </p>
                  )}
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  {nextTier ? (
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(
                          (customer.loyaltyPoints / nextTier.requiredPoints) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  ) : (
                    <div className="h-2 w-full rounded-full bg-green-600"></div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="mb-2 text-md font-medium text-gray-700">Recent Transactions</h3>
              <LoyaltyTransactionsList transactions={customer.loyaltyTransactions.slice(0, 5)} />
              {customer.loyaltyTransactions.length > 5 && (
                <div className="mt-2 text-right">
                  <Link
                    href={`/customers/${customer.id}/loyalty`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View all {customer.loyaltyTransactions.length} transactions
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Addresses */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Addresses</h2>
              <Link
                href={`/customers/${customer.id}/addresses/new`}
                className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
              >
                Add Address
              </Link>
            </div>
            
            <CustomerAddressList addresses={customer.addresses} />
          </div>
          
          {/* Purchase History */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Purchase History</h2>
            
            <CustomerSalesList sales={customer.sales.slice(0, 5)} />
            
            {customer.sales.length > 5 && (
              <div className="mt-4 text-right">
                <Link
                  href={`/customers/${customer.id}/sales`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View all {customer.sales.length} orders
                </Link>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Notes</h2>
              <Link
                href={`/customers/${customer.id}/notes/new`}
                className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
              >
                Add Note
              </Link>
            </div>
            
            <CustomerNotesList notes={customer.customerNotes} />
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Customer Statistics */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Customer Statistics</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Order Value</p>
                <p className="text-xl font-bold text-gray-900">
                  ${averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Purchase</p>
                <p className="font-medium">
                  {customer.sales.length > 0
                    ? format(new Date(customer.sales[0].saleDate), "MMMM d, yyyy")
                    : "No purchases yet"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/customers/${customer.id}/edit`}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Edit Customer
              </Link>
              <Link
                href={`/pos/new?customerId=${customer.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                New Sale
              </Link>
              <Link
                href={`/customers/${customer.id}/loyalty/add`}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
                Add Loyalty Points
              </Link>
            </div>
          </div>
          
          {/* Available Promotions */}
          {availablePromotions.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Available Promotions</h2>
              <div className="space-y-3">
                {availablePromotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <h3 className="font-medium text-gray-800">{promotion.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{promotion.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {promotion.isPercentage
                          ? `${promotion.discountValue}% off`
                          : `$${promotion.discountValue} off`}
                      </span>
                      {promotion.code && (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          Code: {promotion.code}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Valid until {format(new Date(promotion.endDate), "MMM d, yyyy")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Customer Groups */}
          {customer.groups.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Customer Groups</h2>
              <div className="space-y-2">
                {customer.groups.map((groupRelation) => (
                  <div
                    key={groupRelation.groupId}
                    className="rounded-lg border border-gray-200 p-3"
                  >
                    <h3 className="font-medium text-gray-800">{groupRelation.group.name}</h3>
                    {groupRelation.group.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {groupRelation.group.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
