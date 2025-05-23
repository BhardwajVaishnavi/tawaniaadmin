// This script fixes issues with quality control API requests
(function() {
  // Store the original fetch function
  const originalFetch = window.fetch;

  // Override the fetch function
  window.fetch = function(resource, options) {
    // Get the URL from the resource
    const url = typeof resource === 'string' ? resource : resource instanceof URL ? resource.toString() : resource.url;
    
    // If this is a GET request to the quality control API
    if (url.includes('/api/quality-control') && (!options || options.method === undefined || options.method === 'GET')) {
      console.log('Intercepting quality control GET request:', url);
      
      // Parse the URL to get query parameters
      const urlObj = new URL(url, window.location.origin);
      const page = parseInt(urlObj.searchParams.get('page') || '1');
      const limit = parseInt(urlObj.searchParams.get('limit') || '10');
      const type = urlObj.searchParams.get('type');
      const warehouseId = urlObj.searchParams.get('warehouseId');
      const status = urlObj.searchParams.get('status');
      
      // Get quality controls from localStorage
      let qualityControls = [];
      try {
        qualityControls = JSON.parse(localStorage.getItem('qualityControls') || '[]');
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
      
      // Apply filters
      let filteredQCs = qualityControls;
      
      // Filter by type if specified
      if (type) {
        filteredQCs = filteredQCs.filter(qc => qc.type === type);
      }
      
      // Filter by warehouse if specified
      if (warehouseId) {
        filteredQCs = filteredQCs.filter(qc => qc.warehouseId === warehouseId || qc.warehouse?.id === warehouseId);
      }
      
      // Filter by status if specified
      if (status) {
        filteredQCs = filteredQCs.filter(qc => qc.status === status);
      }
      
      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedQCs = filteredQCs.slice(startIndex, endIndex);
      
      // Create the response with pagination
      const mockResponse = {
        qualityControls: paginatedQCs,
        totalItems: filteredQCs.length,
        page,
        limit,
        totalPages: Math.ceil(filteredQCs.length / limit) || 1
      };
      
      // Return a resolved promise with the mock response
      return Promise.resolve(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }));
    }
    
    // If this is a GET request for a specific quality control
    if (url.match(/\/api\/quality-control\/[^\/]+$/)) {
      console.log('Intercepting quality control GET request for specific ID:', url);
      
      // Extract the ID from the URL
      const id = url.split('/').pop();
      
      // Get quality controls from localStorage
      let qualityControls = [];
      try {
        qualityControls = JSON.parse(localStorage.getItem('qualityControls') || '[]');
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
      
      // Find the specific quality control
      const qualityControl = qualityControls.find(qc => qc.id === id);
      
      if (qualityControl) {
        return Promise.resolve(new Response(JSON.stringify(qualityControl), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }));
      } else {
        // If not found, create a mock quality control
        const mockQC = {
          id: id,
          referenceNumber: `QC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
          type: "RECEIVING",
          status: "PENDING",
          warehouseId: "wh-001",
          inspectionDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [],
          warehouse: {
            id: "wh-001",
            name: "Main Warehouse",
          },
          inspectedBy: {
            id: "user-001",
            name: "John Doe",
            email: "john@example.com",
          },
        };
        
        return Promise.resolve(new Response(JSON.stringify(mockQC), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }));
      }
    }
    
    // For all other requests, use the original fetch
    return originalFetch.apply(this, arguments);
  };

  console.log('Quality control API fix applied');
})();
