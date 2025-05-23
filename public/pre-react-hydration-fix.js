// Script to fix hydration mismatches before React hydration
(function() {
  function preReactHydrationFix() {
    try {
      // Create a function to recursively process all elements
      function processElement(element) {
        // Skip non-element nodes
        if (element.nodeType !== Node.ELEMENT_NODE) return;
        
        // Check if this is a loyalty-related element
        const isLoyaltyLink = element.tagName === 'A' && element.getAttribute('href') === '/loyalty';
        const isLoyaltyLi = element.tagName === 'LI' && element.querySelector('a[href="/loyalty"]');
        
        // Process loyalty link
        if (isLoyaltyLink) {
          // Set the correct className
          element.className = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700 hover:shadow-sm';
          
          // Remove any style attribute
          element.removeAttribute('style');
        }
        
        // Process loyalty li
        if (isLoyaltyLi) {
          // Remove any className, data-menu-item, and style attributes
          element.removeAttribute('class');
          element.removeAttribute('data-menu-item');
          element.removeAttribute('style');
        }
        
        // Check if this is the li with className="mt-8"
        if (element.tagName === 'LI' && element.className === 'mt-8') {
          // Ensure it has the correct className to match the client
          element.className = 'mt-8';
        }
        
        // Recursively process all child elements
        Array.from(element.children).forEach(processElement);
      }
      
      // Start processing from the document body
      if (document.body) {
        processElement(document.body);
      }
    } catch (error) {
      console.error('Error in preReactHydrationFix:', error);
    }
  }
  
  // Run immediately
  preReactHydrationFix();
})();
