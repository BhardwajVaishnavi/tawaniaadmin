"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";


interface InwardItem {
  id: string;
  referenceNumber: string;
  date: string;
  supplier: string;
  status: string;
  totalItems: number;
  totalValue: number;
  hasDamagedItems: boolean;
}



export default function InwardsComponent() {
  const [inwards, setInwards] = useState<InwardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Function to refresh data
  const refreshData = () => {
    setInwards([]);
    setError(null);
    setIsLoading(true);
    fetchInwards();
  };

  const fetchInwards = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors

        // Try multiple endpoints in sequence
        const endpoints = [
          "/api/warehouse/movements?movementType=INWARD",
          "/api/warehouse/inwards",
          "/api/inwards"
        ];

        let success = false;

        for (const endpoint of endpoints) {
          if (success) break;

          try {
            console.log(`Trying to fetch inwards from endpoint: ${endpoint}`);
            const response = await fetch(endpoint);

            if (!response.ok) {
              console.error(`Error from ${endpoint}: ${response.status}`);
              continue; // Try next endpoint
            }

            const data = await response.json();
            console.log(`Fetched inwards from ${endpoint}:`, data);

            // Transform the data if needed
            let inwardItems = data.inwards || data.movements || [];

            // Transform warehouse movements to inward items format
            if (data.movements) {
              inwardItems = data.movements.map((movement: any) => ({
                id: movement.id,
                referenceNumber: movement.referenceNumber,
                date: movement.createdAt,
                supplier: movement.sourceType === 'PURCHASE_ORDER' ? 'Purchase Order' :
                         movement.sourceType === 'MANUAL' ? 'Manual Entry' :
                         movement.sourceType || 'Unknown',
                status: movement.status,
                totalItems: movement.totalItems || 0,
                totalValue: movement.totalValue || 0,
                hasDamagedItems: movement.items?.some((item: any) => item.condition === 'DAMAGED') || false
              }));
            } else if (data.inwards) {
              // Handle inwards API response format
              inwardItems = data.inwards.map((inward: any) => ({
                id: inward.id,
                referenceNumber: inward.referenceNumber,
                date: inward.createdAt || inward.date,
                supplier: inward.supplier || 'Unknown',
                status: inward.status,
                totalItems: inward.totalItems || 0,
                totalValue: inward.totalValue || 0,
                hasDamagedItems: inward.hasDamagedItems || false
              }));
            }

            if (inwardItems.length > 0) {
              setInwards(inwardItems);
              success = true;
              break;
            }
          } catch (endpointError) {
            console.error(`Error with endpoint ${endpoint}:`, endpointError);
            // Continue to next endpoint
          }
        }

        if (!success) {
          // If all endpoints fail, show empty state
          console.log("All endpoints failed, no inwards available");
          setInwards([]);
          setError("Unable to load inward shipments. Please check your connection and try again.");
        }
      } catch (error: any) {
        console.error("Error setting up inward shipments:", error);
        setError(error.message || "Failed to fetch inward shipments. API endpoint may not be implemented yet.");

        // Use mock data on error
        const mockInwards = [
          {
            id: "mock-error-1",
            referenceNumber: "INW-ERROR-0001",
            date: new Date().toISOString(),
            supplier: "Mock Supplier (Error Fallback)",
            status: "PENDING",
            totalItems: 3,
            totalValue: 50.00,
            hasDamagedItems: false
          }
        ];

        setInwards(mockInwards);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchInwards();
  }, [searchQuery, statusFilter, dateFilter]);

  // Refresh data when component becomes visible (e.g., when returning from new inward page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchInwards();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Filter inwards based on search query, status, and date
  const filteredInwards = inwards.filter(inward => {
    // Search filter
    const matchesSearch = searchQuery === "" ||
      inward.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inward.supplier.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || inward.status.toLowerCase() === statusFilter.toLowerCase();

    // Date filter
    let matchesDate = true;
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0];
      matchesDate = inward.date.startsWith(today);
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(inward.date) >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = new Date(inward.date) >= monthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Handle status change for individual items
  const handleStatusChange = (inwardId: string, newStatus: string) => {
    // Update the local state immediately
    setInwards(prevInwards =>
      prevInwards.map(inward =>
        inward.id === inwardId
          ? { ...inward, status: newStatus }
          : inward
      )
    );

    // Note: Status changes are stored locally only
    // In a production environment, you would make an API call here
    console.log(`Status updated for inward ${inwardId} to ${newStatus}`);
  };

  // Get status badge color (kept for reference but not used in dropdown)
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };



  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inwards</CardTitle>
        <div className="flex space-x-2">
          <Link href="/products/new">
            <Button>Add Product</Button>
          </Link>
          <Link href="/warehouse/inwards/new">
            <Button>New Inward</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search inward movements..."
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
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CANCELLED">Cancelled</option>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <span className="ml-2">Loading inward movements...</span>
          </div>
        ) : error ? (
          <div className="flex h-40 flex-col items-center justify-center">
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
              <p className="font-medium">Error loading inward movements</p>
              <p className="mt-1 text-sm">{error}</p>
              <p className="mt-2 text-sm">This is expected if the API endpoint is not implemented yet.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-800">
                    <th className="px-4 py-2">Reference</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Supplier</th>
                    <th className="px-4 py-2">Items</th>
                    <th className="px-4 py-2">Total Value</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Damaged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInwards.length > 0 ? (
                    filteredInwards.map((inward) => (
                      <tr key={inward.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">
                          <Link href={`/warehouse/inwards/${inward.id}`} className="text-blue-600 hover:underline">
                            {inward.referenceNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">
                          {format(new Date(inward.date), "MMM dd, yyyy")}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">{inward.supplier}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">{inward.totalItems}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">${inward.totalValue.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <Select
                            value={inward.status}
                            onChange={(e) => handleStatusChange(inward.id, e.target.value)}
                            className="w-full"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="CANCELLED">Cancelled</option>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          {inward.hasDamagedItems ? (
                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="h-24 px-4 py-2 text-center">
                        No inward movements found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>


          </div>
        )}
      </CardContent>
    </Card>
  );
}

