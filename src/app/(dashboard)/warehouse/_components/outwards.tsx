"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

import { format } from "date-fns";
import Link from "next/link";

interface Transfer {
  id: string;
  transferNumber: string;
  createdAt: string;
  status: string;
  fromWarehouse?: {
    id: string;
    name: string;
  } | null;
  toWarehouse?: {
    id: string;
    name: string;
  } | null;
  fromStore?: {
    id: string;
    name: string;
  } | null;
  toStore?: {
    id: string;
    name: string;
  } | null;
  items: any[];
  totalItems: number;
  totalCost: number;
}

export default function OutwardsComponent() {
  // We're only using transfers now, not outwards
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isTransfersLoading, setIsTransfersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transferTypeFilter, setTransferTypeFilter] = useState("all");
  const [transfersError, setTransfersError] = useState<string | null>(null);

  // We're only using the transfers endpoint now

  // Fetch all transfers
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setIsTransfersLoading(true);
        setTransfersError(null); // Clear any previous errors

        // Build query parameters
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (transferTypeFilter !== "all") params.append("type", transferTypeFilter);

        // Try multiple endpoints in sequence
        const endpoints = [
          `/api/transfers?${params.toString()}`,
          `/api/transfers-simple?${params.toString()}`,
          `/api/outwards?${params.toString()}`
        ];

        let success = false;

        for (const endpoint of endpoints) {
          if (success) break;

          try {
            console.log(`Trying to fetch transfers from endpoint: ${endpoint}`);
            const response = await fetch(endpoint);

            if (!response.ok) {
              console.error(`Error from ${endpoint}: ${response.status}`);
              continue; // Try next endpoint
            }

            const data = await response.json();
            console.log(`Fetched transfers from ${endpoint}:`, data);

            if (data.transfers && Array.isArray(data.transfers) && data.transfers.length > 0) {
              setTransfers(data.transfers);
              success = true;
              break;
            }
          } catch (endpointError) {
            console.error(`Error with endpoint ${endpoint}:`, endpointError);
            // Continue to next endpoint
          }
        }

        if (!success) {
          // If all endpoints fail, use mock data
          console.log("All endpoints failed, using mock data");

          const mockTransfers = [
            {
              id: "mock-transfer-1",
              transferNumber: "TRF-20230501-0001",
              createdAt: new Date().toISOString(),
              status: "PENDING",
              fromWarehouse: {
                id: "mock-warehouse-1",
                name: "Main Warehouse"
              },
              toStore: {
                id: "mock-store-1",
                name: "Downtown Store"
              },
              items: [
                { id: "item-1", productId: "prod-1", requestedQuantity: 10 }
              ],
              totalItems: 10,
              totalCost: 199.90
            },
            {
              id: "mock-transfer-2",
              transferNumber: "TRF-20230502-0002",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              status: "COMPLETED",
              fromWarehouse: {
                id: "mock-warehouse-1",
                name: "Main Warehouse"
              },
              toStore: {
                id: "mock-store-2",
                name: "Mall Store"
              },
              items: [
                { id: "item-2", productId: "prod-2", requestedQuantity: 5 }
              ],
              totalItems: 5,
              totalCost: 149.95
            }
          ];

          setTransfers(mockTransfers);
          setTransfersError("Using mock data - API endpoints not available");
        }
      } catch (error: any) {
        console.error("Error fetching transfers:", error);

        // Set error message and mock data
        setTransfersError(error.message || "Failed to fetch transfers. API endpoint may not be implemented yet.");

        // Use mock data on error
        const mockTransfers = [
          {
            id: "mock-error-1",
            transferNumber: "TRF-ERROR-0001",
            createdAt: new Date().toISOString(),
            status: "PENDING",
            fromWarehouse: {
              id: "mock-warehouse-1",
              name: "Main Warehouse"
            },
            toStore: {
              id: "mock-store-1",
              name: "Error Fallback Store"
            },
            items: [
              { id: "item-error-1", productId: "prod-1", requestedQuantity: 3 }
            ],
            totalItems: 3,
            totalCost: 59.97
          }
        ];

        setTransfers(mockTransfers);
      } finally {
        setIsTransfersLoading(false);
      }
    };

    fetchTransfers();
  }, [searchQuery, statusFilter, transferTypeFilter]);

  // Helper function to determine transfer type
  const getTransferType = (transfer: Transfer) => {
    if (transfer.fromWarehouse && transfer.toStore) {
      return "Warehouse to Store";
    } else if (transfer.fromStore && transfer.toWarehouse) {
      return "Store to Warehouse";
    } else if (transfer.fromWarehouse && transfer.toWarehouse) {
      return "Warehouse to Warehouse";
    } else if (transfer.fromStore && transfer.toStore) {
      return "Store to Store";
    } else {
      return "Unknown";
    }
  };

  // Helper function to get transfer source and destination
  const getTransferSourceDestination = (transfer: Transfer) => {
    let source = "";
    let destination = "";

    if (transfer.fromWarehouse) {
      source = `Warehouse: ${transfer.fromWarehouse.name}`;
    } else if (transfer.fromStore) {
      source = `Store: ${transfer.fromStore.name}`;
    }

    if (transfer.toWarehouse) {
      destination = `Warehouse: ${transfer.toWarehouse.name}`;
    } else if (transfer.toStore) {
      destination = `Store: ${transfer.toStore.name}`;
    }

    return { source, destination };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Outwards</CardTitle>
        <div className="flex space-x-2">
          <Link href="/transfers/new">
            <Button>New Transfer</Button>
          </Link>
          <Link href="/warehouse/outwards/new">
            <Button>New Outward</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full">
            <div className="mb-4 flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search transfers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={transferTypeFilter}
                  onChange={(e) => setTransferTypeFilter(e.target.value)}
                  className="w-full"
                >
                  <option value="all">All Types</option>
                  <option value="warehouse-to-store">Warehouse to Store</option>
                  <option value="store-to-warehouse">Store to Warehouse</option>
                  <option value="warehouse-to-warehouse">Warehouse to Warehouse</option>
                  <option value="store-to-store">Store to Store</option>
                </Select>
              </div>
            </div>

            {isTransfersLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                <span className="ml-2">Loading...</span>
              </div>
            ) : transfersError ? (
              <div className="flex h-40 flex-col items-center justify-center">
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
                  <p className="font-medium">Error loading transfers</p>
                  <p className="mt-1 text-sm">{transfersError}</p>
                  <p className="mt-2 text-sm">This is expected if the API endpoint is not implemented yet.</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-800">
                        <th className="px-4 py-2">Reference #</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Type</th>
                        <th className="px-4 py-2">From</th>
                        <th className="px-4 py-2">To</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Items</th>
                        <th className="px-4 py-2 text-right">Value</th>
                        <th className="px-4 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transfers.length > 0 ? (
                        transfers.map((transfer) => {
                          const { source, destination } = getTransferSourceDestination(transfer);
                          return (
                            <tr key={transfer.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium">{transfer.transferNumber || `TRF-${transfer.id.substring(0, 8)}`}</td>
                              <td className="px-4 py-2">
                                {transfer.createdAt ? (
                                  (() => {
                                    try {
                                      return format(new Date(transfer.createdAt), "MMM dd, yyyy");
                                    } catch (e) {
                                      return format(new Date(), "MMM dd, yyyy");
                                    }
                                  })()
                                ) : (
                                  format(new Date(), "MMM dd, yyyy")
                                )}
                              </td>
                              <td className="px-4 py-2">{getTransferType(transfer)}</td>
                              <td className="px-4 py-2">{source}</td>
                              <td className="px-4 py-2">{destination}</td>
                              <td className="px-4 py-2">
                                {transfer.status ? (
                                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                    transfer.status === "COMPLETED"
                                      ? "bg-green-100 text-green-800"
                                      : transfer.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : transfer.status === "IN_TRANSIT"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                                  }`}>
                                    {transfer.status.replace ? transfer.status.replace("_", " ") : transfer.status}
                                  </span>
                                ) : (
                                  <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                                    Unknown
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-right">{transfer.totalItems || 0}</td>
                              <td className="px-4 py-2 text-right">${(transfer.totalCost || 0).toFixed(2)}</td>
                              <td className="px-4 py-2 text-right">
                                <div className="flex justify-end space-x-2">
                                  <Link href={`/transfers/${transfer.id}`}>
                                    <Button variant="outline" size="sm">View</Button>
                                  </Link>
                                  <Link href={`/transfers/${transfer.id}/edit`}>
                                    <Button variant="outline" size="sm" className="bg-green-50 text-green-600 hover:bg-green-100">
                                      Edit
                                    </Button>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="h-24 px-4 py-2 text-center">
                            No transfers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

