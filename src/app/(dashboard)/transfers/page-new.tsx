"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Mock data for transfers
const mockTransfers = [
  {
    id: "mock-1",
    referenceNumber: "TRF-20230501-0001",
    type: "WAREHOUSE_TO_STORE",
    status: "DRAFT",
    sourceWarehouseId: "mock-warehouse-1",
    sourceWarehouse: {
      id: "mock-warehouse-1",
      name: "Main Warehouse"
    },
    destinationStoreId: "mock-store-1",
    destinationStore: {
      id: "mock-store-1",
      name: "Downtown Store"
    },
    items: [
      { id: "item-1", productId: "prod-1", requestedQuantity: 10 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "mock-2",
    referenceNumber: "TRF-20230502-0002",
    type: "WAREHOUSE_TO_STORE",
    status: "COMPLETED",
    sourceWarehouseId: "mock-warehouse-1",
    sourceWarehouse: {
      id: "mock-warehouse-1",
      name: "Main Warehouse"
    },
    destinationStoreId: "mock-store-2",
    destinationStore: {
      id: "mock-store-2",
      name: "Mall Store"
    },
    items: [
      { id: "item-2", productId: "prod-2", requestedQuantity: 5 },
      { id: "item-3", productId: "prod-3", requestedQuantity: 3 }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  }
];

// Global variable to store transfers
let transfers = [...mockTransfers];

// Function to add a new transfer
export function addTransfer(transfer: any) {
  transfers.unshift(transfer);
}

export default function TransfersPage() {
  const [displayTransfers, setDisplayTransfers] = useState(transfers);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      setDisplayTransfers(transfers);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transfers</h1>
        <Link
          href="/inventory/warehouse/adjust"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Transfer
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-800">
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Destination</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-800">
                    Loading transfers...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="mx-auto max-w-lg rounded-md bg-red-50 p-4 text-red-800">
                      <h3 className="text-lg font-medium">Error loading transfers</h3>
                      <p className="mt-2 text-sm">{error}</p>
                      <div className="mt-4 flex justify-center gap-2">
                        <button
                          onClick={() => window.location.reload()}
                          className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
                        >
                          Try Again
                        </button>
                        <Link
                          href="/inventory/warehouse/adjust"
                          className="rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-200"
                        >
                          Create New Transfer
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : displayTransfers.length > 0 ? (
                displayTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">
                      <Link href={`/transfers/${transfer.id}`}>
                        {transfer.referenceNumber}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                      {formatTransferType(transfer)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                      {transfer.sourceWarehouse?.name || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                      {transfer.destinationStore?.name || transfer.destinationWarehouse?.name || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <TransferStatusBadge status={transfer.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                      {transfer.items?.length || 0}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">
                      {transfer.createdAt && formatDistanceToNow(new Date(transfer.createdAt), { addSuffix: true })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/transfers/${transfer.id}`}
                          className="rounded bg-blue-50 p-1 text-blue-600 hover:bg-blue-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </Link>
                        {transfer.status === "DRAFT" && (
                          <Link
                            href={`/transfers/${transfer.id}/edit`}
                            className="rounded bg-green-50 p-1 text-green-600 hover:bg-green-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-800">
                    No transfers found. <Link href="/inventory/warehouse/adjust" className="text-blue-600 hover:underline">Create a new transfer</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatTransferType(transfer: any) {
  if (!transfer) return "Unknown";

  // Use the type field directly
  switch (transfer.type) {
    case "WAREHOUSE_TO_WAREHOUSE":
      return "Warehouse to Warehouse";
    case "WAREHOUSE_TO_STORE":
      return "Warehouse to Store";
    case "STORE_TO_WAREHOUSE":
      return "Store to Warehouse";
    case "STORE_TO_STORE":
      return "Store to Store";
    default:
      return transfer.type || "Unknown";
  }
}

function TransferStatusBadge({ status }: { status: string }) {
  let color;
  let label;

  if (!status) {
    color = "bg-gray-100 text-gray-800";
    label = "Unknown";
  } else {
    switch (status) {
      case "DRAFT":
        color = "bg-gray-100 text-gray-800";
        label = "Draft";
        break;
      case "PENDING":
        color = "bg-yellow-100 text-yellow-800";
        label = "Pending";
        break;
      case "APPROVED":
        color = "bg-blue-100 text-blue-800";
        label = "Approved";
        break;
      case "REJECTED":
        color = "bg-red-100 text-red-800";
        label = "Rejected";
        break;
      case "IN_TRANSIT":
        color = "bg-purple-100 text-purple-800";
        label = "In Transit";
        break;
      case "COMPLETED":
        color = "bg-green-100 text-green-800";
        label = "Completed";
        break;
      case "CANCELLED":
        color = "bg-red-100 text-red-800";
        label = "Cancelled";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
        label = status;
    }
  }

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
