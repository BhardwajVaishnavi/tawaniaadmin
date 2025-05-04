import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Receipt } from "../../_components/receipt";

export default async function SalePrintPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const saleId = params.id;

  // Get sale with related data
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      store: true,
      customer: true,
      user: true,
      items: {
        include: {
          product: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!sale) {
    notFound();
  }

  // Get company information
  const companyInfo = {
    name: "Your Company Name",
    address: "123 Main Street, City, State, ZIP",
    phone: "(123) 456-7890",
    email: "info@yourcompany.com",
    website: "www.yourcompany.com",
    taxId: "TAX-123456789",
  };

  return (
    <div className="bg-white p-8 print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Print Receipt</h1>
          <button
            onClick={() => window.print()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 print:hidden"
          >
            Print
          </button>
        </div>
        
        <div className="rounded-lg border border-gray-200 p-6 print:border-0 print:p-0 print:shadow-none">
          <Receipt sale={sale} companyInfo={companyInfo} />
        </div>
      </div>
    </div>
  );
}
