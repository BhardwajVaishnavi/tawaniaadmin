// Script to ensure the loyalty button remains visible
(function() {
  // This function runs immediately
  function ensureLoyaltyVisible() {
    try {
      // Create a style element to ensure the loyalty button is visible
      const style = document.createElement('style');
      style.textContent = `
        /* Ensure the loyalty button is visible */
        a[href="/loyalty"] {
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: static !important;
          pointer-events: auto !important;
        }
        
        /* Ensure the parent li elements are visible */
        li:has(> a[href="/loyalty"]),
        li:has(> div > ul > li > a[href="/loyalty"]),
        li:has(> ul > li > a[href="/loyalty"]) {
          display: list-item !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: static !important;
          pointer-events: auto !important;
        }
        
        /* Ensure the mt-8 class is applied correctly */
        li.mt-8 {
          margin-top: 2rem !important;
        }
      `;
      document.head.appendChild(style);
      
      // Create a function to ensure the loyalty button is visible
      function makeLoyaltyVisible() {
        // Find all loyalty links
        const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
        
        // Process each loyalty link
        loyaltyLinks.forEach(link => {
          // Make sure the link is visible
          link.style.display = 'flex';
          link.style.visibility = 'visible';
          link.style.opacity = '1';
          link.style.position = 'static';
          link.style.pointerEvents = 'auto';
          
          // Find the parent li element
          const parentLi = link.closest('li');
          if (parentLi) {
            // Make sure the li is visible
            parentLi.style.display = 'list-item';
            parentLi.style.visibility = 'visible';
            parentLi.style.opacity = '1';
            parentLi.style.position = 'static';
            parentLi.style.pointerEvents = 'auto';
          }
        });
      }
      
      // Run the makeLoyaltyVisible function immediately
      makeLoyaltyVisible();
      
      // Also run it after a short delay
      setTimeout(makeLoyaltyVisible, 1000);
      
      // Run it periodically to ensure it stays visible
      setInterval(makeLoyaltyVisible, 2000);
    } catch (error) {
      console.error('Error in ensureLoyaltyVisible:', error);
    }
  }
  
  // Run when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureLoyaltyVisible);
  } else {
    ensureLoyaltyVisible();
  }
})();
