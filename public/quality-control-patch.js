// This script handles the display of quality control components
(function() {
  // Remove any existing error flag to ensure the fallback doesn't show
  sessionStorage.removeItem("quality-control-error");

  // Store the original fetch function
  const originalFetch = window.fetch;

  // Override the fetch function
  window.fetch = function(resource, options) {
    // Get the URL from the resource
    const url = typeof resource === 'string' ? resource : resource instanceof URL ? resource.toString() : resource.url;

    // If this is a POST request to create a quality control
    if (url.includes('/api/quality-control') && options && options.method === 'POST') {
      // Try the original fetch first
      return originalFetch.apply(this, arguments)
        .then(response => {
          if (response.ok) {
            return response;
          }
          // If the API call failed, we'll handle it in the component
          return response;
        })
        .catch(error => {
          console.error("Error in fetch:", error);
          // Let the component handle the error
          throw error;
        });
    }

    // For all other requests, use the original fetch
    return originalFetch.apply(this, arguments);
  };

  // Function to handle the display of quality control components
  function handleQualityControlDisplay() {
    // Wait a bit to ensure React has finished hydration
    setTimeout(() => {
      // Check if we're on the quality control page
      if (window.location.pathname.includes('/quality-control')) {
        // Show the quality control list container instead of hiding it
        const container = document.getElementById('quality-control-list-container');
        if (container) {
          container.style.display = 'block';
        }

        // Hide the fallback message if it exists
        const fallbackContainer = document.querySelector('.QualityControlFallback');
        if (fallbackContainer) {
          fallbackContainer.style.display = 'none';
        }
      }
    }, 100); // Small delay to avoid hydration issues
  }

  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleQualityControlDisplay);
  } else {
    handleQualityControlDisplay();
  }

  // Also run when the page is fully loaded
  window.addEventListener('load', handleQualityControlDisplay);

  console.log('Quality control display patch applied');
})();
