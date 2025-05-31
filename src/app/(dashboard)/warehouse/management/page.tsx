"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import InwardsComponent from "../_components/inwards";
import OutwardsComponent from "../_components/outwards";
import OutOfStockComponent from "../_components/out-of-stock";
import ClosingStockComponent from "../_components/closing-stock";

export default function WarehouseManagementPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "inwards");

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Warehouse Management</h1>
        <p className="text-gray-800">
          Manage warehouse inventory, transfers, and stock levels
        </p>
      </div>

      <div>
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: "inwards", name: "Inwards", description: "Products coming into warehouse" },
              { id: "outwards", name: "Outwards", description: "Products going out to inventory" },
              { id: "out-of-stock", name: "Out of Stock", description: "Products that are finished" },
              { id: "closing-stock", name: "Closing Stock", description: "Final stock status" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-800 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "inwards" && <InwardsComponent />}
          {activeTab === "outwards" && <OutwardsComponent />}
          {activeTab === "out-of-stock" && <OutOfStockComponent />}
          {activeTab === "closing-stock" && <ClosingStockComponent />}
        </div>
      </div>
    </div>
  );
}
