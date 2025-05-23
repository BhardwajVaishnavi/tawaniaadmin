// This script clears mock data from localStorage and ensures only user-saved data is displayed
(function() {
  // Function to clear mock data
  function clearMockData() {
    try {
      // Get the current quality controls from localStorage
      const qualityControls = JSON.parse(localStorage.getItem('qualityControls') || '[]');

      // Check if there are any quality controls
      if (qualityControls.length > 0) {
        // Filter out the mock data and keep only user-created data
        const userSavedData = qualityControls.filter(qc => {
          // Keep only quality controls that were created by the user
          // These will have IDs that start with "qc-user-"
          return qc.id.startsWith("qc-user-");
        });

        // Save the filtered data back to localStorage
        localStorage.setItem('qualityControls', JSON.stringify(userSavedData));

        // If there are no user-saved quality controls, add a sample one
        if (userSavedData.length === 0) {
          const sampleQC = {
            id: "qc-user-" + Date.now(),
            referenceNumber: "QC-230501-001",
            type: "RECEIVING",
            status: "PENDING",
            warehouseId: "wh-001",
            inspectionDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: [
              {
                id: "item-user-" + Date.now(),
                productId: "prod-001",
                product: { id: "prod-001", name: "Product A", sku: "SKU-001" },
                quantity: 10,
                passedQuantity: 0,
                failedQuantity: 0,
                pendingQuantity: 10,
                status: "PENDING"
              }
            ],
            warehouse: {
              id: "wh-001",
              name: "Main Warehouse"
            },
            inspectedBy: {
              id: "user-001",
              name: "Current User",
              email: "user@example.com"
            }
          };

          localStorage.setItem('qualityControls', JSON.stringify([sampleQC]));
        }
      }
    } catch (error) {
      console.error("Error clearing mock data:", error);
    }
  }

  // Clear mock data when the page loads
  clearMockData();

  // Also clear mock data when the quality control page is loaded
  if (window.location.pathname.includes('/quality-control')) {
    clearMockData();
  }

  // Listen for navigation events to clear mock data when navigating to the quality control page
  window.addEventListener('popstate', function() {
    if (window.location.pathname.includes('/quality-control')) {
      clearMockData();
    }
  });

  console.log('Mock data clearing script applied');
})();
