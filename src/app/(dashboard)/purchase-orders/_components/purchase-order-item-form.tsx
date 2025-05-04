"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  category: {
    id: string;
    name: string;
  };
}

interface OrderItem {
  id?: string;
  productId: string;
  product?: Product;
  description?: string;
  orderedQuantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  notes?: string;
}

interface PurchaseOrderItemFormProps {
  products: Product[];
  editingItem?: OrderItem;
  editingIndex?: number;
  onAddItem: (item: OrderItem) => void;
  onUpdateItem: (item: OrderItem, index: number) => void;
  onCancelEdit?: () => void;
}

export function PurchaseOrderItemForm({
  products,
  editingItem,
  editingIndex,
  onAddItem,
  onUpdateItem,
  onCancelEdit,
}: PurchaseOrderItemFormProps) {
  // Form state
  const [productId, setProductId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("");
  
  // Calculated values
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Set form values when editing an item
  useEffect(() => {
    if (editingItem) {
      setProductId(editingItem.productId);
      setDescription(editingItem.description || "");
      setQuantity(editingItem.orderedQuantity);
      setUnitPrice(editingItem.unitPrice);
      setDiscount(editingItem.discount);
      setTax(editingItem.tax);
      setNotes(editingItem.notes || "");
    }
  }, [editingItem]);
  
  // Update price when product changes
  useEffect(() => {
    if (productId) {
      const selectedProduct = products.find(p => p.id === productId);
      if (selectedProduct) {
        setUnitPrice(selectedProduct.costPrice);
      }
    }
  }, [productId, products]);
  
  // Calculate subtotal and total
  useEffect(() => {
    const calculatedSubtotal = quantity * unitPrice;
    setSubtotal(calculatedSubtotal);
    
    const calculatedTotal = calculatedSubtotal + tax - discount;
    setTotal(calculatedTotal);
  }, [quantity, unitPrice, discount, tax]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId || quantity <= 0 || unitPrice <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }
    
    const selectedProduct = products.find(p => p.id === productId);
    
    const item: OrderItem = {
      id: editingItem?.id,
      productId,
      product: selectedProduct,
      description,
      orderedQuantity: quantity,
      unitPrice,
      discount,
      tax,
      subtotal,
      total,
      notes,
    };
    
    if (editingIndex !== undefined) {
      onUpdateItem(item, editingIndex);
    } else {
      onAddItem(item);
    }
    
    // Reset form
    resetForm();
  };
  
  // Reset form fields
  const resetForm = () => {
    setProductId("");
    setDescription("");
    setQuantity(1);
    setUnitPrice(0);
    setDiscount(0);
    setTax(0);
    setNotes("");
    
    if (onCancelEdit) {
      onCancelEdit();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="product" className="mb-1 block text-sm font-medium text-gray-800">
            Product *
          </label>
          <select
            id="product"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              
              // Set description based on selected product
              const selectedProduct = products.find(p => p.id === e.target.value);
              if (selectedProduct) {
                setDescription(selectedProduct.name);
              }
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku}) - ${product.costPrice.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-800">
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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
            min="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="unitPrice" className="mb-1 block text-sm font-medium text-gray-800">
            Unit Price *
          </label>
          <input
            id="unitPrice"
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            min="0.01"
            step="0.01"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="discount" className="mb-1 block text-sm font-medium text-gray-800">
            Discount
          </label>
          <input
            id="discount"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            min="0"
            step="0.01"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="tax" className="mb-1 block text-sm font-medium text-gray-800">
            Tax
          </label>
          <input
            id="tax"
            type="number"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value))}
            min="0"
            step="0.01"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-800">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-800">
            Subtotal: <span className="font-medium">${subtotal.toFixed(2)}</span>
          </p>
          <p className="text-sm font-medium">
            Total: <span className="font-bold">${total.toFixed(2)}</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
          >
            {editingItem ? "Cancel" : "Clear"}
          </Button>
          <Button type="submit">
            {editingItem ? "Update Item" : "Add Item"}
          </Button>
        </div>
      </div>
    </form>
  );
}
