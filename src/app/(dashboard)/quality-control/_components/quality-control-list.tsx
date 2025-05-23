"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Eye, RotateCw } from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
}

interface QualityControl {
  id: string;
  referenceNumber: string;
  type: string;
  status: string;
  warehouse: {
    id: string;
    name: string;
  };
  inspectionDate: string;
  completedDate?: string;
  inspectedBy: {
    id: string;
    name: string;
  };
  items: {
    id: string;
    product: {
      id: string;
      name: string;
    };
    quantity: number;
    passedQuantity: number;
    failedQuantity: number;
    status: string;
  }[];
}

interface QualityControlListProps {
  warehouses: Warehouse[];
}

export function QualityControlList({ warehouses }: QualityControlListProps) {
  const router = useRouter();

  // State
  const [qualityControls, setQualityControls] = useState<QualityControl[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Filters
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch quality controls
  const fetchQualityControls = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");

      if (warehouseId) {
        params.append("warehouseId", warehouseId);
      }

      if (type) {
        params.append("type", type);
      }

      if (status) {
        params.append("status", status);
      }

      try {
        const response = await fetch(`/api/quality-control?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch quality controls");
        }

        const data = await response.json();

        // Check if we got valid data
        if (data && Array.isArray(data.qualityControls)) {
          setQualityControls(data.qualityControls);
          setTotalPages(data.totalPages || 1);
          setTotalItems(data.totalItems || data.qualityControls.length);
        } else {
          // If the data format is unexpected, try to get data from localStorage
          throw new Error("Invalid data format");
        }
      } catch (fetchError) {
        console.error("Error fetching from API:", fetchError);

        // Fallback: Try to get data from localStorage
        try {
          const storedQCs = JSON.parse(localStorage.getItem('qualityControls') || '[]');

          // Apply filters
          let filteredQCs = storedQCs;

          if (warehouseId) {
            filteredQCs = filteredQCs.filter((qc: any) =>
              qc.warehouseId === warehouseId || qc.warehouse?.id === warehouseId
            );
          }

          if (type) {
            filteredQCs = filteredQCs.filter((qc: any) => qc.type === type);
          }

          if (status) {
            filteredQCs = filteredQCs.filter((qc: any) => qc.status === status);
          }

          // Calculate pagination
          const startIndex = (page - 1) * 10;
          const endIndex = startIndex + 10;
          const paginatedQCs = filteredQCs.slice(startIndex, endIndex);

          setQualityControls(paginatedQCs);
          setTotalPages(Math.ceil(filteredQCs.length / 10) || 1);
          setTotalItems(filteredQCs.length);
        } catch (storageError) {
          console.error("Error reading from localStorage:", storageError);

          // If localStorage also fails, use empty data
          setQualityControls([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      }
    } catch (err) {
      console.error("Error in fetchQualityControls:", err);
      setError("Failed to load quality controls. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchQualityControls();
  }, [page, warehouseId, type, status]);

  // Also fetch when the component mounts
  useEffect(() => {
    fetchQualityControls();

    // Set up an interval to refresh the data every 2 seconds
    // This ensures that newly created quality controls are displayed
    const intervalId = setInterval(() => {
      fetchQualityControls();
    }, 2000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchQualityControls();
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Get type badge color
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "RECEIVING":
        return <Badge className="bg-blue-100 text-blue-800">Receiving</Badge>;
      case "RETURN":
        return <Badge className="bg-purple-100 text-purple-800">Return</Badge>;
      case "RANDOM":
        return <Badge className="bg-green-100 text-green-800">Random</Badge>;
      case "COMPLAINT":
        return <Badge className="bg-red-100 text-red-800">Complaint</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="p-4 border-b grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label htmlFor="warehouse" className="block text-sm font-medium text-gray-800 mb-1">
            Warehouse
          </label>
          <select
            id="warehouse"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-800 mb-1">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="RECEIVING">Receiving</option>
            <option value="RETURN">Return</option>
            <option value="RANDOM">Random</option>
            <option value="COMPLAINT">Complaint</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-800 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-800 mb-1">
            Search
          </label>
          <Input
            id="search"
            type="text"
            placeholder="Search by reference #"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full"
          />
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <RotateCw className="h-8 w-8 mx-auto animate-spin text-gray-800" />
            <p className="mt-2 text-gray-800">Loading quality controls...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button
              onClick={fetchQualityControls}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : qualityControls.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-800">No quality controls found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Reference #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Warehouse
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Inspector
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {qualityControls.map((qc) => (
                <tr key={qc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {qc.referenceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {getTypeBadge(qc.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {qc.warehouse.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {format(new Date(qc.inspectionDate), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {qc.inspectedBy.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {getStatusBadge(qc.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {qc.items.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <Link href={`/quality-control/${qc.id}`}>
                      <Button className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="p-4 border-t">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          <p className="text-sm text-gray-800 mt-2 text-center">
            Showing {qualityControls.length} of {totalItems} quality controls
          </p>
        </div>
      )}
    </div>
  );
}

