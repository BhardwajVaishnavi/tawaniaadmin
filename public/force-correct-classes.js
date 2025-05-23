// Script to force the correct class names on problematic elements
(function() {
  // This function runs immediately
  function forceCorrectClasses() {
    try {
      // Define the correct class names
      const correctMt8Class = 'mt-8';
      const correctLoyaltyLinkClass = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700 hover:shadow-sm';
      
      // Create a function to fix class names
      function fixClassNames() {
        // Find all li elements with className="mt-8" or className=null
        const mt8Elements = document.querySelectorAll('li.mt-8, li[class="null"]');
        
        // Process each mt-8 element
        mt8Elements.forEach(li => {
          // Check if this is the li that should have className="mt-8"
          const hasLoyaltyDescendant = li.querySelector('a[href="/loyalty"]');
          const hasCustomerManagementHeading = li.querySelector('h3:contains("Customer Management")');
          
          if (hasLoyaltyDescendant || hasCustomerManagementHeading) {
            // Force the correct className
            li.className = correctMt8Class;
          }
        });
        
        // Find all loyalty links
        const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
        
        // Process each loyalty link
        loyaltyLinks.forEach(link => {
          // Force the correct className
          link.className = correctLoyaltyLinkClass;
          
          // Remove any style attribute
          link.removeAttribute('style');
          
          // Find the parent li element
          const parentLi = link.closest('li');
          if (parentLi) {
            // Remove any className, data-menu-item, and style attributes
            parentLi.removeAttribute('class');
            parentLi.removeAttribute('data-menu-item');
            parentLi.removeAttribute('style');
          }
        });
      }
      
      // Run the fixClassNames function immediately
      fixClassNames();
      
      // Also run it after a short delay
      setTimeout(fixClassNames, 0);
      
      // Create a MutationObserver to watch for DOM changes
      const observer = new MutationObserver((mutations) => {
        // Run the fixClassNames function after each mutation
        fixClassNames();
      });
      
      // Start observing the document
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'data-menu-item']
      });
      
      // Override Object.defineProperty to prevent React from changing the className
      const originalDefineProperty = Object.defineProperty;
      Object.defineProperty = function(obj, prop, descriptor) {
        // Check if this is a className property
        if (prop === 'className' && obj instanceof HTMLElement) {
          // Check if this is a loyalty-related element
          const isLoyaltyLink = obj.tagName === 'A' && obj.getAttribute('href') === '/loyalty';
          const isMt8Li = obj.tagName === 'LI' && obj.className === correctMt8Class;
          
          // If this is a loyalty link, prevent changing the className
          if (isLoyaltyLink) {
            return obj;
          }
          
          // If this is the mt-8 li, prevent changing the className
          if (isMt8Li) {
            return obj;
          }
        }
        
        // Call the original defineProperty function
        return originalDefineProperty.call(this, obj, prop, descriptor);
      };
    } catch (error) {
      console.error('Error in forceCorrectClasses:', error);
    }
  }
  
  // Run immediately
  forceCorrectClasses();
})();
