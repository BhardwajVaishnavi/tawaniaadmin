// Script to restore the loyalty program button in the sidebar
(function() {
  function restoreLoyaltyButton() {
    try {
      // Find the loyalty button by its href
      const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
      
      loyaltyLinks.forEach(link => {
        // Remove any inline styles that might be hiding it
        link.style.display = '';
        link.style.visibility = 'visible';
        
        // Find the parent li element
        const parentLi = link.closest('li');
        if (parentLi) {
          // Make sure the li is visible
          parentLi.style.display = '';
          parentLi.style.visibility = 'visible';
          
          // Add the data-menu-item attribute if it's missing
          if (!parentLi.hasAttribute('data-menu-item')) {
            parentLi.setAttribute('data-menu-item', 'loyalty');
          }
        }
      });
      
      // Find the loyalty menu item by its data-menu-item attribute
      const loyaltyItems = document.querySelectorAll('li[data-menu-item="loyalty"]');
      
      loyaltyItems.forEach(item => {
        // Make sure the item is visible
        item.style.display = '';
        item.style.visibility = 'visible';
      });
    } catch (error) {
      console.error('Error restoring loyalty button:', error);
    }
  }
  
  // Run the function when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreLoyaltyButton);
  } else {
    restoreLoyaltyButton();
  }
  
  // Also run it after a short delay to catch any dynamically added content
  setTimeout(restoreLoyaltyButton, 500);
  
  // Run it periodically to ensure it stays visible
  setInterval(restoreLoyaltyButton, 1000);
})();
