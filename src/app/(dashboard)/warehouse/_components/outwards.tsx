"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";


interface OutwardItem {
  id: string;
  referenceNumber: string;
  date: string;
  destination: string;
  status: string;
  totalItems: number;
  totalValue: number;
  hasDamagedItems: boolean;
  isClosingStock: boolean;
}

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
  const [outwards, setOutwards] = useState<OutwardItem[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransfersLoading, setIsTransfersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [transferTypeFilter, setTransferTypeFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [transfersError, setTransfersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutwards = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors

        // Fetch transfers from the backend (warehouse to store transfers)
        const response = await fetch("/api/transfers");

        if (!response.ok) {
          throw new Error(`Failed to fetch outward shipments: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Filter transfers that are from warehouse to store (outward)
        const warehouseToStoreTransfers = data.transfers?.filter((transfer: any) =>
          transfer.fromWarehouseId && transfer.toStoreId
        ) || [];

        // Transform the data to match our component's expected format
        const outwardItems = warehouseToStoreTransfers.map((transfer: any) => {
          // Check if any items in this transfer have zero remaining stock in the warehouse
          const hasClosingStock = transfer.items?.some((item: any) => {
            // Find the inventory item for this product in the source warehouse
            const inventoryItem = item.product?.inventoryItems?.find((inv: any) =>
              inv.warehouseId === transfer.fromWarehouseId
            );

            // If quantity after transfer would be zero or less, it's closing stock
            return inventoryItem && (inventoryItem.quantity - item.quantity) <= 0;
          }) || false;

          // Check if any items in this transfer are marked as damaged
          const hasDamagedItems = transfer.items?.some((item: any) =>
            item.notes?.toLowerCase().includes('damaged') ||
            item.adjustmentReason?.toLowerCase().includes('damaged')
          ) || false;

          return {
            id: transfer.id,
            referenceNumber: transfer.transferNumber,
            date: transfer.createdAt,
            destination: transfer.toStore?.name || "Unknown Store",
            status: transfer.status.toLowerCase(),
            totalItems: transfer.totalItems || 0,
            totalValue: transfer.totalCost || 0,
            hasDamagedItems: hasDamagedItems,
            isClosingStock: hasClosingStock
          };
        });

        setOutwards(outwardItems);
      } catch (error: any) {
        console.error("Error fetching outward shipments:", error);

        // Set error message and empty array
        setError(error.message || "Failed to fetch outward shipments. API endpoint may not be implemented yet.");
        setOutwards([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutwards();
  }, []);

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

        // Fetch transfers
        const response = await fetch(`/api/transfers?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch transfers: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setTransfers(data.transfers || []);
      } catch (error: any) {
        console.error("Error fetching transfers:", error);

        // Set error message and empty array
        setTransfersError(error.message || "Failed to fetch transfers. API endpoint may not be implemented yet.");
        setTransfers([]);
      } finally {
        setIsTransfersLoading(false);
      }
    };

    fetchTransfers();
  }, [searchQuery, statusFilter, transferTypeFilter]);

  // Filter outwards based on search query, status, and date
  const filteredOutwards = outwards.filter(outward => {
    // Search filter
    const matchesSearch = searchQuery === "" ||
      outward.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outward.destination.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || outward.status.toLowerCase() === statusFilter.toLowerCase();

    // Date filter
    let matchesDate = true;
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      matchesDate = outward.date.startsWith(today);
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(outward.date) >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = new Date(outward.date) >= monthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Shipped</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "partial":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
                              <td className="px-4 py-2 font-medium">{transfer.transferNumber}</td>
                              <td className="px-4 py-2">{format(new Date(transfer.createdAt), "MMM dd, yyyy")}</td>
                              <td className="px-4 py-2">{getTransferType(transfer)}</td>
                              <td className="px-4 py-2">{source}</td>
                              <td className="px-4 py-2">{destination}</td>
                              <td className="px-4 py-2">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                  transfer.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : transfer.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : transfer.status === "IN_TRANSIT"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {transfer.status.replace("_", " ")}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right">{transfer.totalItems}</td>
                              <td className="px-4 py-2 text-right">${transfer.totalCost.toFixed(2)}</td>
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

