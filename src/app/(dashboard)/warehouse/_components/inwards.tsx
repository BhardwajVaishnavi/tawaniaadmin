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

interface Product {
  id: string;
  name: string;
  sku: string;
  category: {
    id: string;
    name: string;
  };
  costPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  minStockLevel: number;
  reorderPoint: number;
  isActive: boolean;
  condition: string;
}

export default function InwardsComponent() {
  const [inwards, setInwards] = useState<InwardItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const fetchInwards = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors

        // Fetch inward shipments from the API
        const response = await fetch("/api/warehouse/inwards");

        if (!response.ok) {
          throw new Error(`Failed to fetch inward shipments: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Transform the data if needed
        const inwardItems = data.inwards || [];

        setInwards(inwardItems);
      } catch (error: any) {
        console.error("Error setting up inward shipments:", error);
        setError(error.message || "Failed to fetch inward shipments. API endpoint may not be implemented yet.");
        setInwards([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInwards();
  }, [searchQuery, statusFilter, dateFilter]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsProductsLoading(true);
        setProductsError(null); // Clear any previous errors

        // Fetch products from the API
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Get products and categories from the response
        const products = data.products || [];
        const categoriesData = data.categories || [];

        // Set categories if not already loaded
        if (categories.length === 0 && categoriesData.length > 0) {
          setCategories(categoriesData);
        }

        // Filter products based on search and filters
        let filteredProducts = [...products];

        if (searchQuery) {
          const search = searchQuery.toLowerCase();
          filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(search) ||
            product.sku.toLowerCase().includes(search)
          );
        }

        if (categoryFilter !== "all") {
          filteredProducts = filteredProducts.filter(product =>
            product.category.id === categoryFilter
          );
        }

        if (productStatusFilter !== "all") {
          const isActive = productStatusFilter === "active";
          filteredProducts = filteredProducts.filter(product =>
            product.isActive === isActive
          );
        }

        if (conditionFilter !== "all") {
          filteredProducts = filteredProducts.filter(product =>
            product.condition === conditionFilter
          );
        }

        // Calculate pagination
        const totalItems = filteredProducts.length;
        const totalPages = Math.ceil(totalItems / pageSize);

        // Get current page items
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        setProducts(paginatedProducts);
        setTotalPages(totalPages);
        setTotalItems(totalItems);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        setProductsError(error.message || "Failed to fetch products. API endpoint may not be implemented yet.");
        setProducts([]);
        setCategories([]);
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, categoryFilter, productStatusFilter, conditionFilter, page, pageSize, categories.length]);

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

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "received":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Received</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "partial":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle page change for products
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
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
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select
              value={productStatusFilter}
              onChange={(e) => setProductStatusFilter(e.target.value)}
              className="w-full"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full"
            >
              <option value="all">All Conditions</option>
              <option value="NEW">New</option>
              <option value="DAMAGED">Damaged</option>
            </Select>
          </div>
        </div>

        {isProductsLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : productsError ? (
          <div className="flex h-40 flex-col items-center justify-center">
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
              <p className="font-medium">Error loading products</p>
              <p className="mt-1 text-sm">{productsError}</p>
              <p className="mt-2 text-sm">This is expected if the API endpoint is not implemented yet.</p>
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-800">
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Condition</th>
                    <th className="px-4 py-2">Cost Price</th>
                    <th className="px-4 py-2">Retail Price</th>
                    <th className="px-4 py-2">Min Stock</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">
                          <Link href={`/products/${product.id}`} className="text-blue-600 hover:underline">
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">{product.sku}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">{product.category.name}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            product.condition === "NEW"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}>
                            {product.condition === "NEW" ? "New" : "Damaged"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800">${product.costPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">${product.retailPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">{product.minStockLevel}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {product.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end space-x-2">
                            <Link href={`/products/${product.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`/products/${product.id}/edit`}>
                              <Button variant="outline" size="sm" className="bg-green-50 text-green-600 hover:bg-green-100">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="h-24 px-4 py-2 text-center">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                <div>
                  <p className="text-sm text-gray-800">
                    Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * pageSize, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

