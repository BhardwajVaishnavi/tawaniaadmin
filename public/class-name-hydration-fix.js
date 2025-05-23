// Script to fix className hydration mismatches in the sidebar
(function() {
  function fixClassNameHydrationMismatches() {
    try {
      // Find all li elements in the sidebar
      const sidebarLiElements = document.querySelectorAll('.flex.h-full.w-64.flex-col li');
      
      // Process each li element
      sidebarLiElements.forEach(li => {
        // Check if this is the li with className="mt-8"
        if (li.className === 'mt-8') {
          // Ensure it has the correct className to match the client
          li.className = 'mt-8';
        }
        
        // Check if this is a li that contains the loyalty link
        const loyaltyLink = li.querySelector('a[href="/loyalty"]');
        if (loyaltyLink) {
          // Remove any className, data-menu-item, and style attributes
          li.removeAttribute('class');
          li.removeAttribute('data-menu-item');
          li.removeAttribute('style');
          
          // Remove any style attribute from the loyalty link
          loyaltyLink.removeAttribute('style');
          
          // Ensure the loyalty link has the correct className
          if (loyaltyLink.className) {
            // Make sure it has the correct className to match the client
            loyaltyLink.className = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700 hover:shadow-sm';
          }
        }
      });
      
      // Find all anchor elements with href="/loyalty"
      const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
      
      // Process each loyalty link
      loyaltyLinks.forEach(link => {
        // Ensure it has the correct className
        link.className = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700 hover:shadow-sm';
        
        // Remove any style attribute
        link.removeAttribute('style');
      });
    } catch (error) {
      console.error('Error fixing className hydration mismatches:', error);
    }
  }
  
  // Run immediately
  fixClassNameHydrationMismatches();
  
  // Also run after a short delay to catch any dynamically added elements
  setTimeout(fixClassNameHydrationMismatches, 0);
})();
