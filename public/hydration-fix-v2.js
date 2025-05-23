// This script fixes hydration mismatches by using a more robust approach
(function() {
  // Function to handle hydration mismatches
  function fixHydrationMismatches() {
    // Wait for the DOM to be fully loaded and React to finish hydration
    setTimeout(() => {
      // Find all elements that might cause hydration mismatches
      const loyaltyMenuItems = document.querySelectorAll('a[href="/loyalty"]');
      
      // Process each loyalty menu item
      loyaltyMenuItems.forEach(item => {
        const listItem = item.closest('li');
        if (listItem) {
          // Remove any inline styles or classes that might cause hydration mismatches
          listItem.removeAttribute('style');
          listItem.classList.remove('loyalty-menu-item');
          
          // Add a data attribute that we can target with CSS
          listItem.setAttribute('data-menu-item', 'loyalty');
        }
      });
      
      // Create a style element to hide the loyalty menu item
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        li[data-menu-item="loyalty"] {
          display: none !important;
        }
      `;
      document.head.appendChild(styleElement);
    }, 500); // Wait 500ms to ensure React has finished hydration
  }
  
  // Run the fix after the page has loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixHydrationMismatches);
  } else {
    fixHydrationMismatches();
  }
  
  // Also run the fix when the page is fully loaded
  window.addEventListener('load', fixHydrationMismatches);
  
  console.log('Hydration fix v2 applied');
})();
