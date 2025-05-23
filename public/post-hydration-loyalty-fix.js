// Script to ensure the loyalty button is visible after React hydration
(function() {
  function postHydrationLoyaltyFix() {
    try {
      // Wait for React to finish hydration
      setTimeout(() => {
        // Find the loyalty button by its href
        const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
        
        loyaltyLinks.forEach(link => {
          // Make sure the link is visible without adding inline styles
          // This avoids hydration mismatches while still ensuring visibility
          const linkDisplay = window.getComputedStyle(link).display;
          const linkVisibility = window.getComputedStyle(link).visibility;
          
          if (linkDisplay === 'none' || linkVisibility === 'hidden') {
            // Instead of modifying the element directly, add a class
            link.classList.add('loyalty-visible');
          }
          
          // Find the parent li element
          const parentLi = link.closest('li');
          if (parentLi) {
            const liDisplay = window.getComputedStyle(parentLi).display;
            const liVisibility = window.getComputedStyle(parentLi).visibility;
            
            if (liDisplay === 'none' || liVisibility === 'hidden') {
              // Add a class instead of inline styles
              parentLi.classList.add('loyalty-visible');
            }
          }
        });
        
        // Add a style element with CSS rules to ensure visibility
        const style = document.createElement('style');
        style.textContent = `
          .loyalty-visible {
            display: list-item !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          /* Ensure the loyalty button is visible without inline styles */
          a[href="/loyalty"] {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          /* Ensure the parent li is visible */
          a[href="/loyalty"]::after {
            content: "";
            display: inline;
          }
        `;
        document.head.appendChild(style);
      }, 1000); // Wait for React hydration to complete
    } catch (error) {
      console.error('Error in postHydrationLoyaltyFix:', error);
    }
  }
  
  // Run when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', postHydrationLoyaltyFix);
  } else {
    postHydrationLoyaltyFix();
  }
})();
