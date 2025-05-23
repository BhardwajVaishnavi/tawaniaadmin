// Script to fix the hydration mismatch for the loyalty button
(function() {
  // This function runs immediately before React hydration
  function fixLoyaltyHydrationMismatch() {
    try {
      // Find all elements that might cause hydration mismatches
      const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
      
      // Remove any inline styles and data attributes that might cause hydration mismatches
      loyaltyLinks.forEach(link => {
        // Remove inline styles that might cause hydration mismatches
        if (link.hasAttribute('style')) {
          link.removeAttribute('style');
        }
        
        // Find the parent li elements
        const parentLi = link.closest('li');
        if (parentLi) {
          // Remove data-menu-item attribute that might cause hydration mismatches
          if (parentLi.hasAttribute('data-menu-item')) {
            parentLi.removeAttribute('data-menu-item');
          }
          
          // Remove inline styles that might cause hydration mismatches
          if (parentLi.hasAttribute('style')) {
            parentLi.removeAttribute('style');
          }
          
          // Also check the parent of the parent li
          const grandparentLi = parentLi.parentElement && parentLi.parentElement.closest('li');
          if (grandparentLi && grandparentLi.hasAttribute('data-menu-item')) {
            grandparentLi.removeAttribute('data-menu-item');
          }
          
          if (grandparentLi && grandparentLi.hasAttribute('style')) {
            grandparentLi.removeAttribute('style');
          }
        }
      });
      
      // Find all li elements with data-menu-item="loyalty"
      const loyaltyItems = document.querySelectorAll('li[data-menu-item="loyalty"]');
      loyaltyItems.forEach(item => {
        // Remove the data-menu-item attribute
        item.removeAttribute('data-menu-item');
        
        // Remove inline styles
        if (item.hasAttribute('style')) {
          item.removeAttribute('style');
        }
      });
    } catch (error) {
      console.error('Error fixing loyalty hydration mismatch:', error);
    }
  }
  
  // Run immediately before React hydration
  fixLoyaltyHydrationMismatch();
})();
