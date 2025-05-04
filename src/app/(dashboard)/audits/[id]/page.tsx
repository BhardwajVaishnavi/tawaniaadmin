import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { AuditStatusBadge } from "../_components/audit-status-badge";
import { AuditActions } from "../_components/audit-actions";
import { AuditItemsTable } from "../_components/audit-items-table";

export default async function AuditDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Await params to fix Next.js error
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // Get audit details
  const audit = await prisma.audit.findUnique({
    where: {
      id,
    },
    include: {
      warehouse: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignments: {
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
      items: {
        include: {
          product: true,
          inventoryItem: {
            include: {
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
          },
        },
      },
    },
  });

  if (!audit) {
    notFound();
  }

  // Calculate audit statistics
  const totalItems = audit.items.length;
  const countedItems = audit.items.filter(item =>
    item.status === "COUNTED" ||
    item.status === "RECONCILED" ||
    item.status === "DISCREPANCY"
  ).length;
  const discrepancyItems = audit.items.filter(item => item.status === "DISCREPANCY").length;
  const progress = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;

  // Group items by zone
  const itemsByZone = audit.items.reduce((acc, item) => {
    const zone = item.inventoryItem?.bin?.shelf?.aisle?.zone;
    const zoneName = zone ? zone.name : "Unassigned";

    if (!acc[zoneName]) {
      acc[zoneName] = [];
    }

    acc[zoneName].push(item);
    return acc;
  }, {} as Record<string, typeof audit.items>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit: {audit.referenceNumber}</h1>
          <div className="mt-1 flex items-center gap-2">
            <AuditStatusBadge status={audit.status} />
            <span className="text-sm text-gray-500">
              Created on {format(new Date(audit.createdAt), "MMMM d, yyyy")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AuditActions audit={audit} />
          <Link
            href="/audits"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Back to Audits
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Audit Details */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Audit Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Warehouse</p>
                <p className="font-medium">
                  <Link href={`/warehouses/${audit.warehouseId}`} className="text-blue-600 hover:underline">
                    {audit.warehouse.name}
                  </Link>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <AuditStatusBadge status={audit.status} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">
                  {format(new Date(audit.startDate), "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">
                  {audit.endDate
                    ? format(new Date(audit.endDate), "MMMM d, yyyy")
                    : "Not completed"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">
                  {audit.createdBy.name || audit.createdBy.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Users */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Assigned Users</h2>
            {audit.assignments.length === 0 ? (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No users assigned to this audit</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {audit.assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-lg border border-gray-200 p-4">
                    <p className="font-medium">{assignment.user.name || assignment.user.email}</p>
                    {assignment.assignedZones && (
                      <p className="mt-1 text-xs text-gray-500">
                        Assigned to {JSON.parse(assignment.assignedZones).length} zones
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Items */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Audit Items</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              <Link
                href={`/audits/${audit.id}/items`}
                className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
              >
                View All Items
              </Link>
              <Link
                href={`/audits/${audit.id}/items?status=DISCREPANCY`}
                className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
              >
                View Discrepancies
              </Link>
              {audit.status === "IN_PROGRESS" && (
                <Link
                  href={`/audits/${audit.id}/count`}
                  className="rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
                >
                  Continue Counting
                </Link>
              )}
            </div>

            {Object.keys(itemsByZone).length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No items found for this audit</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(itemsByZone).map(([zoneName, items]) => (
                  <div key={zoneName}>
                    <h3 className="mb-2 text-md font-medium text-gray-700">Zone: {zoneName}</h3>
                    <AuditItemsTable items={items.slice(0, 5)} />
                    {items.length > 5 && (
                      <div className="mt-2 text-right">
                        <Link
                          href={`/audits/${audit.id}/items?zone=${items[0].inventoryItem?.bin?.shelf?.aisle?.zoneId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View all {items.length} items in this zone
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {audit.notes && (
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-2 text-lg font-semibold text-gray-800">Notes</h2>
              <p className="whitespace-pre-line text-gray-700">{audit.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Actions */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Actions</h2>
            <div className="space-y-3">
              {audit.status === "PLANNED" && (
                <>
                  <Link
                    href={`/audits/${audit.id}/edit`}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Edit Audit
                  </Link>
                  <form action={`/api/audits/${audit.id}/start`} method="GET">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                      </svg>
                      Start Audit
                    </button>
                  </form>
                </>
              )}

              {audit.status === "IN_PROGRESS" && (
                <>
                  <Link
                    href={`/audits/${audit.id}/count`}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                    Continue Counting
                  </Link>
                  <Link
                    href={`/audits/${audit.id}/complete`}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Complete Audit
                  </Link>
                </>
              )}

              {audit.status === "COMPLETED" && (
                <Link
                  href={`/audits/${audit.id}/report`}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Generate Report
                </Link>
              )}

              {(audit.status === "PLANNED" || audit.status === "IN_PROGRESS") && (
                <form action={`/api/audits/${audit.id}/cancel`} method="GET">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Cancel Audit
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Audit Statistics */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Audit Statistics</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="font-medium">{totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Counted Items</p>
                <p className="font-medium">{countedItems}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Discrepancies</p>
                <p className="font-medium text-red-600">{discrepancyItems}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Accuracy Rate</p>
                <p className="font-medium">
                  {countedItems > 0
                    ? `${Math.round(((countedItems - discrepancyItems) / countedItems) * 100)}%`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Information */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Audit Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Reference Number</p>
                <p className="font-medium">{audit.referenceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {format(new Date(audit.createdAt), "MMMM d, yyyy h:mm a")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(audit.updatedAt), "MMMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
