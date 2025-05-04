import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReturnsList } from "./_components/returns-list";

export default async function ReturnsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  // Parse search parameters
  const storeId = searchParams.store as string | undefined;
  const status = searchParams.status as string | undefined;
  const search = searchParams.search as string | undefined;
  const page = parseInt(searchParams.page as string || "1");
  const pageSize = 10;

  // Get stores for filter
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  // Get returns with pagination
  const filters: any = {};

  if (storeId) {
    filters.storeId = storeId;
  }

  if (status) {
    filters.status = status;
  }

  if (search) {
    filters.OR = [
      { returnNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { email: { contains: search, mode: 'insensitive' } } },
      { customer: { phone: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [returns, totalCount] = await Promise.all([
    // @ts-ignore - Dynamically access the model
    prisma.return.findMany({
      where: filters,
      include: {
        store: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        processedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    // @ts-ignore - Dynamically access the model
    prisma.return.count({
      where: filters,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Returns</h1>
        <a
          href="/returns/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          New Return
        </a>
      </div>

      <ReturnsList
        returns={returns}
        stores={stores}
        currentStoreId={storeId}
        currentStatus={status}
        currentSearch={search}
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
      />
    </div>
  );
}

