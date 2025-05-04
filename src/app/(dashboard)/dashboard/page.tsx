import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Get counts for dashboard using our simplified schema
  const storeCount = await prisma.store.count();
  const productCount = await prisma.product.count();
  const inventoryCount = await prisma.inventoryItem.count();
  const salesCount = await prisma.sale.count();

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white">
          Welcome back, {session?.user?.name}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Stores"
          value={storeCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          }
          href="/stores"
          color="blue"
        />
        <DashboardCard
          title="Products"
          value={productCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          }
          href="/products"
          color="green"
        />
        <DashboardCard
          title="Inventory Items"
          value={inventoryCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          }
          href="/inventory"
          color="purple"
        />
        <DashboardCard
          title="Sales"
          value={salesCount}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
          href="/sales"
          color="orange"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-blue-600">Recent Sales</h2>
            <Link href="/sales" className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-sm font-medium text-white hover:shadow-md transition-all duration-300">
              View all
            </Link>
          </div>
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/50">
            <p className="text-gray-800">No recent sales</p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-amber-600">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/pos/new" className="flex items-center gap-3 rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-200 text-green-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">New Sale</p>
                <p className="text-xs text-gray-800">Create a new sale</p>
              </div>
            </Link>
            <Link href="/products/new" className="flex items-center gap-3 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-200 text-purple-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Add Product</p>
                <p className="text-xs text-gray-800">Create a new product</p>
              </div>
            </Link>
            <Link href="/inventory/new" className="flex items-center gap-3 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-blue-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Add Inventory</p>
                <p className="text-xs text-gray-800">Add inventory items</p>
              </div>
            </Link>
            <Link href="/stores/new" className="flex items-center gap-3 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Add Store</p>
                <p className="text-xs text-gray-800">Create a new store</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  color: "purple" | "blue" | "green" | "red" | "orange" | "pink";
  alert?: boolean;
}

function DashboardCard({ title, value, icon, href, color, alert }: DashboardCardProps) {
  // Define different color schemes for cards
  const colorSchemes = {
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      text: "text-purple-800",
      icon: "bg-purple-200 text-purple-600",
      hover: "hover:shadow-lg hover:shadow-purple-100/50 hover:translate-y-[-2px]",
      border: "border-purple-200"
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      text: "text-blue-800",
      icon: "bg-blue-200 text-blue-600",
      hover: "hover:shadow-lg hover:shadow-blue-100/50 hover:translate-y-[-2px]",
      border: "border-blue-200"
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      text: "text-green-800",
      icon: "bg-green-200 text-green-600",
      hover: "hover:shadow-lg hover:shadow-green-100/50 hover:translate-y-[-2px]",
      border: "border-green-200"
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      text: "text-red-800",
      icon: "bg-red-200 text-red-600",
      hover: "hover:shadow-lg hover:shadow-red-100/50 hover:translate-y-[-2px]",
      border: "border-red-200"
    },
    orange: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      text: "text-amber-800",
      icon: "bg-amber-200 text-amber-600",
      hover: "hover:shadow-lg hover:shadow-amber-100/50 hover:translate-y-[-2px]",
      border: "border-amber-200"
    },
    pink: {
      bg: "bg-gradient-to-br from-pink-50 to-pink-100",
      text: "text-pink-800",
      icon: "bg-pink-200 text-pink-600",
      hover: "hover:shadow-lg hover:shadow-pink-100/50 hover:translate-y-[-2px]",
      border: "border-pink-200"
    }
  };

  const scheme = colorSchemes[color];

  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg border ${scheme.border} ${scheme.bg} p-6 transition-all duration-300 ${scheme.hover}`}
    >
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className={`text-3xl font-bold ${scheme.text}`}>{value}</p>
      </div>
      <div className={`rounded-full p-3 ${scheme.icon} shadow-md`}>
        {icon}
      </div>
    </Link>
  );
}
