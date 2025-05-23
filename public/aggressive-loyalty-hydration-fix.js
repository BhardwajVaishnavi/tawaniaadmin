// Script to aggressively fix the loyalty button hydration mismatch
(function() {
  // This function runs immediately before React hydration
  function aggressivelyFixLoyaltyHydration() {
    try {
      // Create a function to recursively clean all elements
      function cleanElement(element) {
        // Skip non-element nodes
        if (element.nodeType !== Node.ELEMENT_NODE) return;
        
        // Check if this is a loyalty-related element
        const isLoyaltyLink = element.tagName === 'A' && element.getAttribute('href') === '/loyalty';
        const isLoyaltyLi = element.tagName === 'LI' && 
          (element.getAttribute('data-menu-item') === 'loyalty' || 
           element.classList.contains('loyalty-menu-item'));
        
        // If this is a loyalty-related element, clean it
        if (isLoyaltyLink || isLoyaltyLi) {
          // Remove all attributes except href for links
          const attributesToKeep = isLoyaltyLink ? ['href'] : [];
          
          // Get all attribute names
          const attributeNames = [];
          for (let i = 0; i < element.attributes.length; i++) {
            attributeNames.push(element.attributes[i].name);
          }
          
          // Remove attributes that shouldn't be kept
          attributeNames.forEach(attr => {
            if (!attributesToKeep.includes(attr)) {
              element.removeAttribute(attr);
            }
          });
          
          // For links, ensure we keep only the href attribute
          if (isLoyaltyLink) {
            // Re-add the href attribute to ensure it's clean
            const href = element.getAttribute('href');
            element.removeAttribute('href');
            element.setAttribute('href', href);
          }
          
          // For li elements, ensure we keep only the basic structure
          if (isLoyaltyLi) {
            // Remove all classes
            element.className = '';
            
            // Remove any inline styles
            element.removeAttribute('style');
            
            // Remove any data attributes
            attributeNames.forEach(attr => {
              if (attr.startsWith('data-')) {
                element.removeAttribute(attr);
              }
            });
          }
        }
        
        // Recursively clean all child elements
        Array.from(element.children).forEach(cleanElement);
      }
      
      // Start cleaning from the document body
      if (document.body) {
        cleanElement(document.body);
      }
      
      // Add a style element to ensure the loyalty button is visible
      const style = document.createElement('style');
      style.textContent = `
        /* Ensure the loyalty button is visible without inline styles */
        a[href="/loyalty"] {
          display: flex !important;
        }
        
        /* Ensure the parent li elements are visible */
        li:has(> a[href="/loyalty"]),
        li:has(> div > ul > li > a[href="/loyalty"]) {
          display: list-item !important;
        }
      `;
      document.head.appendChild(style);
    } catch (error) {
      console.error('Error in aggressivelyFixLoyaltyHydration:', error);
    }
  }
  
  // Run immediately before React hydration
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aggressivelyFixLoyaltyHydration, { once: true });
  } else {
    aggressivelyFixLoyaltyHydration();
  }
})();
