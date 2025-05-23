// Script to fix loyalty hydration mismatches as early as possible
(function() {
  // This function runs immediately
  function earliestLoyaltyFix() {
    try {
      // Create a MutationObserver to watch for the loyalty elements being added to the DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            // Check if any loyalty-related elements were added
            const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
            if (loyaltyLinks.length > 0) {
              // Clean all loyalty-related elements
              loyaltyLinks.forEach(link => {
                // Remove any inline styles
                if (link.hasAttribute('style')) {
                  link.removeAttribute('style');
                }
                
                // Find the parent li element
                const parentLi = link.closest('li');
                if (parentLi) {
                  // Remove any data-menu-item attribute
                  if (parentLi.hasAttribute('data-menu-item')) {
                    parentLi.removeAttribute('data-menu-item');
                  }
                  
                  // Remove any loyalty-menu-item class
                  if (parentLi.classList.contains('loyalty-menu-item')) {
                    parentLi.classList.remove('loyalty-menu-item');
                  }
                  
                  // Remove any inline styles
                  if (parentLi.hasAttribute('style')) {
                    parentLi.removeAttribute('style');
                  }
                  
                  // Also check the parent of the parent li
                  const grandparentLi = parentLi.parentElement && parentLi.parentElement.closest('li');
                  if (grandparentLi) {
                    // Remove any data-menu-item attribute
                    if (grandparentLi.hasAttribute('data-menu-item')) {
                      grandparentLi.removeAttribute('data-menu-item');
                    }
                    
                    // Remove any inline styles
                    if (grandparentLi.hasAttribute('style')) {
                      grandparentLi.removeAttribute('style');
                    }
                  }
                }
              });
              
              // Disconnect the observer once we've found and cleaned the loyalty elements
              observer.disconnect();
            }
          }
        });
      });
      
      // Start observing the document
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    } catch (error) {
      console.error('Error in earliestLoyaltyFix:', error);
    }
  }
  
  // Run immediately
  earliestLoyaltyFix();
})();
