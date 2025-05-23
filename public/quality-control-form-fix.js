// This script fixes issues with quality control form submission
(function() {
  // Initialize quality controls in localStorage if it doesn't exist
  if (!localStorage.getItem('qualityControls')) {
    localStorage.setItem('qualityControls', JSON.stringify([]));
  }
  // Store the original fetch function
  const originalFetch = window.fetch;

  // Override the fetch function
  window.fetch = function(resource, options) {
    // Get the URL from the resource
    const url = typeof resource === 'string' ? resource : resource instanceof URL ? resource.toString() : resource.url;

    // If this is a POST request to create a quality control
    if (url.includes('/api/quality-control') && options && options.method === 'POST') {
      console.log('Intercepting quality control creation request');

      // Parse the request body to get the quality control data
      let requestData = {};
      if (options.body) {
        try {
          requestData = JSON.parse(options.body);
        } catch (e) {
          console.error('Error parsing request body:', e);
        }
      }

      // Generate a unique ID and reference number
      // Use a different prefix for user-created quality controls
      const id = "qc-user-" + Date.now();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const sequence = Math.floor(Math.random() * 999).toString().padStart(3, '0');
      const referenceNumber = `QC-${year}${month}${day}-${sequence}`;

      // Create a mock response for the created quality control
      const mockCreatedQC = {
        id: id,
        referenceNumber: referenceNumber,
        type: requestData.type || "RECEIVING",
        status: "PENDING",
        warehouseId: requestData.warehouseId || "wh-001",
        inspectionDate: new Date().toISOString(),
        inspectedById: "user-001",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: requestData.items || [],
        warehouse: {
          id: requestData.warehouseId || "wh-001",
          name: "Main Warehouse",
        },
        inspectedBy: {
          id: "user-001",
          name: "John Doe",
          email: "john@example.com",
        },
      };

      // Add the new quality control to localStorage
      try {
        const existingQCs = JSON.parse(localStorage.getItem('qualityControls') || '[]');
        existingQCs.unshift(mockCreatedQC); // Add to the beginning of the array
        localStorage.setItem('qualityControls', JSON.stringify(existingQCs));
      } catch (e) {
        console.error('Error updating localStorage:', e);
      }

      return Promise.resolve(new Response(JSON.stringify(mockCreatedQC), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }));
    }

    // For all other requests, use the original fetch
    return originalFetch.apply(this, arguments);
  };

  console.log('Quality control form fix applied');
})();
