// Script to restore the loyalty button after React hydration
(function() {
  function restoreLoyaltyAfterHydration() {
    try {
      // Wait for React hydration to complete
      setTimeout(() => {
        // Find all loyalty-related elements
        const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
        
        // Ensure the loyalty links are visible
        loyaltyLinks.forEach(link => {
          // Use a MutationObserver to watch for changes to the link
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes') {
                // If the style attribute was changed, ensure the link is visible
                if (mutation.attributeName === 'style') {
                  const computedStyle = window.getComputedStyle(link);
                  if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                    // Create a new element to replace the hidden one
                    const newLink = link.cloneNode(true);
                    newLink.style.display = 'flex';
                    newLink.style.visibility = 'visible';
                    newLink.style.opacity = '1';
                    
                    // Replace the hidden link with the visible one
                    link.parentNode.replaceChild(newLink, link);
                  }
                }
              }
            });
          });
          
          // Start observing the link
          observer.observe(link, { attributes: true });
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
      }, 2000); // Wait for React hydration to complete
    } catch (error) {
      console.error('Error in restoreLoyaltyAfterHydration:', error);
    }
  }
  
  // Run when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreLoyaltyAfterHydration);
  } else {
    restoreLoyaltyAfterHydration();
  }
})();
