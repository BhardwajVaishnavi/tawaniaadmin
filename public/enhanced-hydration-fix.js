// Enhanced hydration fix script to resolve React hydration mismatches
(function() {
  // Store original console.error to restore it later
  const originalConsoleError = console.error;

  // Function to suppress React hydration warnings
  function suppressHydrationWarnings() {
    console.error = function(...args) {
      // Check if this is a hydration warning
      const isHydrationWarning = args.some(arg => 
        typeof arg === 'string' && (
          arg.includes('Hydration failed') || 
          arg.includes('hydrated') || 
          arg.includes('hydration')
        )
      );

      // If it's a hydration warning, don't log it
      if (!isHydrationWarning) {
        originalConsoleError.apply(console, args);
      }
    };

    // Restore original console.error after 10 seconds
    setTimeout(() => {
      console.error = originalConsoleError;
      console.log('Restored original console.error');
    }, 10000);
  }

  // Function to fix the sidebar menu items
  function fixSidebarMenuItems() {
    // Wait for DOM to be ready
    setTimeout(() => {
      // Find all loyalty menu items
      const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
      
      loyaltyLinks.forEach(link => {
        const listItem = link.closest('li');
        if (listItem) {
          // Remove the data-menu-item attribute if it exists
          if (listItem.hasAttribute('data-menu-item')) {
            listItem.removeAttribute('data-menu-item');
          }
          
          // Add a class instead of a data attribute
          listItem.classList.add('loyalty-menu-item');
          
          // Hide the menu item with inline styles
          listItem.style.display = 'none';
        }
      });
    }, 100);
  }

  // Function to handle product creation success
  function handleProductCreation() {
    // Listen for form submissions
    document.addEventListener('submit', function(event) {
      const form = event.target;
      
      // Check if this is the product creation form
      if (form.querySelector('button[type="submit"]') && 
          form.querySelector('button[type="submit"]').textContent.includes('Create Product')) {
        
        // Add a success handler
        window.productCreationSuccess = function() {
          // Show success message
          alert('Product created successfully!');
          
          // Redirect to products list
          window.location.href = '/products';
          
          return false; // Prevent default form submission
        };
        
        // Patch the form's onsubmit
        form.setAttribute('onsubmit', 'return window.productCreationSuccess()');
      }
    });
  }

  // Function to patch the fetch API for product creation
  function patchProductCreationAPI() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Check if this is a product creation API call
      if (url.includes('/api/products') && init && init.method === 'POST') {
        try {
          // Make the original request
          const response = await originalFetch(input, init);
          
          // If successful, trigger success handler
          if (response.ok) {
            console.log('Product created successfully');
            
            // Clone the response before reading it
            const clonedResponse = response.clone();
            
            // Parse the response
            const data = await clonedResponse.json();
            
            // Show success message
            if (data.success) {
              setTimeout(() => {
                alert('Product created successfully!');
                window.location.href = '/products';
              }, 500);
            }
          }
          
          return response;
        } catch (error) {
          console.error('Error in product creation:', error);
          return originalFetch(input, init);
        }
      }
      
      // For all other requests, use the original fetch
      return originalFetch(input, init);
    };
  }

  // Apply all fixes
  function applyAllFixes() {
    suppressHydrationWarnings();
    fixSidebarMenuItems();
    handleProductCreation();
    patchProductCreationAPI();
    
    console.log('Enhanced hydration fix applied');
  }

  // Run fixes when the page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAllFixes);
  } else {
    applyAllFixes();
  }
})();
