// Script to fix the className="null" issue
(function() {
  function fixNullClassNames() {
    try {
      // Find all elements with className="null"
      const elementsWithNullClass = document.querySelectorAll('[class="null"]');
      
      // Process each element
      elementsWithNullClass.forEach(element => {
        // Check if this is a loyalty-related element
        const isLoyaltyLink = element.tagName === 'A' && element.getAttribute('href') === '/loyalty';
        
        // If this is a loyalty link, set the correct className
        if (isLoyaltyLink) {
          element.className = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700 hover:shadow-sm';
        } else {
          // For other elements, remove the className attribute
          element.removeAttribute('class');
        }
      });
      
      // Create a MutationObserver to watch for elements with className="null"
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const element = mutation.target;
            
            // Check if the className is "null"
            if (element.className === 'null') {
              // Check if this is a loyalty-related element
              const isLoyaltyLink = element.tagName === 'A' && element.getAttribute('href') === '/loyalty';
              
              // If this is a loyalty link, set the correct className
              if (isLoyaltyLink) {
                element.className = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700 hover:shadow-sm';
              } else {
                // For other elements, remove the className attribute
                element.removeAttribute('class');
              }
            }
          }
        });
      });
      
      // Start observing the document
      observer.observe(document.documentElement, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class']
      });
    } catch (error) {
      console.error('Error fixing null classNames:', error);
    }
  }
  
  // Run immediately
  fixNullClassNames();
  
  // Also run after a short delay to catch any dynamically added elements
  setTimeout(fixNullClassNames, 0);
})();
