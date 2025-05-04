"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdjustInventoryPage() {
  const router = useRouter();
  
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [warehouseId, setWarehouseId] = useState("");
  const [productId, setProductId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("stock_count");
  const [notes, setNotes] = useState("");
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/inventory/data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        setWarehouses(data.warehouses || []);
        setProducts(data.products || []);
        setInventoryItems(data.inventoryItems || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter products based on selected warehouse
  const filteredProducts = warehouseId
    ? products.filter(product => {
        return inventoryItems.some(item => 
          item.warehouseId === warehouseId && 
          item.productId === product.id
        );
      })
    : [];
  
  // Get current inventory item
  const currentInventoryItem = warehouseId && productId
    ? inventoryItems.find(item => 
        item.warehouseId === warehouseId && 
        item.productId === productId
      )
    : null;
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!warehouseId || !productId || quantity <= 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const adjustmentData = {
        warehouseId,
        productId,
        adjustmentType,
        quantity,
        reason,
        notes,
      };
      
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to adjust inventory');
      }
      
      // Redirect to inventory page
      router.push('/inventory/warehouse');
      router.refresh();
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      alert('Failed to adjust inventory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Adjust Inventory</h1>
        <Link
          href="/inventory/warehouse"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors"
        >
          Back to Inventory
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-lg bg-white p-6 shadow-md">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-800">Loading data...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-md">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="warehouse" className="mb-1 block text-sm font-medium text-gray-800">
                Warehouse *
              </label>
              <select
                id="warehouse"
                value={warehouseId}
                onChange={(e) => {
                  setWarehouseId(e.target.value);
                  setProductId("");
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="product" className="mb-1 block text-sm font-medium text-gray-800">
                Product *
              </label>
              <select
                id="product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={!warehouseId}
              >
                <option value="">Select Product</option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
            </div>
            
            {currentInventoryItem && (
              <div className="md:col-span-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 font-medium text-blue-800">Current Inventory</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-800">Current Quantity</p>
                      <p className="text-lg font-bold">{currentInventoryItem.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Min Stock Level</p>
                      <p className="text-lg font-medium">{products.find(p => p.id === productId)?.minStockLevel || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">Reorder Point</p>
                      <p className="text-lg font-medium">{products.find(p => p.id === productId)?.reorderPoint || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="adjustmentType" className="mb-1 block text-sm font-medium text-gray-800">
                Adjustment Type *
              </label>
              <select
                id="adjustmentType"
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
                <option value="set">Set Exact Quantity</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-gray-800">
                Quantity *
              </label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={1}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="reason" className="mb-1 block text-sm font-medium text-gray-800">
                Reason *
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="stock_count">Stock Count</option>
                <option value="damaged">Damaged/Expired</option>
                <option value="returned">Customer Return</option>
                <option value="supplier_delivery">Supplier Delivery</option>
                <option value="internal_use">Internal Use</option>
                <option value="correction">Data Correction</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-800">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/inventory/warehouse')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!warehouseId || !productId || quantity <= 0 || isSubmitting}
            >
              {adjustmentType === 'add' ? 'Add Stock' : adjustmentType === 'remove' ? 'Remove Stock' : 'Set Quantity'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
