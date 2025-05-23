// Script to fix className issues after React hydration
(function() {
  function postHydrationClassFix() {
    try {
      // Wait for React hydration to complete
      setTimeout(() => {
        // Find all loyalty links
        const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
        
        // Process each loyalty link
        loyaltyLinks.forEach(link => {
          // Check if the className is null
          if (link.className === null || link.className === 'null') {
            // Set the correct className
            link.className = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700 hover:shadow-sm';
          }
          
          // Find the parent li element
          const parentLi = link.closest('li');
          if (parentLi) {
            // Check if the className is empty
            if (parentLi.className === '') {
              // Remove the className attribute entirely
              parentLi.removeAttribute('class');
            }
            
            // Remove any data-menu-item attribute
            if (parentLi.hasAttribute('data-menu-item')) {
              parentLi.removeAttribute('data-menu-item');
            }
          }
        });
        
        // Find all li elements with className="mt-8"
        const mt8Elements = document.querySelectorAll('li.mt-8');
        
        // Process each mt-8 element
        mt8Elements.forEach(li => {
          // Ensure it has the correct className
          if (li.className !== 'mt-8') {
            li.className = 'mt-8';
          }
        });
        
        // Add a style element to ensure the loyalty button is visible
        const style = document.createElement('style');
        style.textContent = `
          /* Ensure the loyalty button is visible */
          a[href="/loyalty"] {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          /* Ensure the parent li elements are visible */
          li:has(> a[href="/loyalty"]),
          li:has(> div > ul > li > a[href="/loyalty"]) {
            display: list-item !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        `;
        document.head.appendChild(style);
      }, 1000); // Wait for React hydration to complete
    } catch (error) {
      console.error('Error in postHydrationClassFix:', error);
    }
  }
  
  // Run when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', postHydrationClassFix);
  } else {
    postHydrationClassFix();
  }
})();
