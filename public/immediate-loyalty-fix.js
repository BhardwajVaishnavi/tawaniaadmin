// Immediate script to hide "Loyalty Program: Default Loyalty Program" line
(function() {
  // Create a style element
  const style = document.createElement('style');
  style.textContent = `
    /* Hide any element that contains exactly "Loyalty Program: Default Loyalty Program" */
    div:not(.rounded-lg):not(.flex) {
      visibility: visible;
    }
    
    div:not(.rounded-lg):not(.flex):only-child:empty + div:not(.rounded-lg):not(.flex) {
      display: none !important;
    }
    
    /* Target the exact text node */
    .space-y-6 > div:not([class]):not(:empty) {
      display: none !important;
    }
    
    /* Hide the heading in LoyaltyProgramOverview */
    h2:contains("Loyalty Program: Default Loyalty Program") {
      display: none !important;
    }
  `;
  
  // Add the style to the head
  document.head.appendChild(style);
  
  // Create a mutation observer to watch for changes to the DOM
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        // Check each added node
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if this is the loyalty program line
            if (node.textContent && node.textContent.trim() === 'Loyalty Program: Default Loyalty Program') {
              node.style.display = 'none';
            }
            
            // Check for headings
            const headings = node.querySelectorAll('h2');
            headings.forEach(function(heading) {
              if (heading.textContent && heading.textContent.includes('Loyalty Program: Default Loyalty Program')) {
                heading.style.display = 'none';
              }
            });
          }
        });
      }
    });
  });
  
  // Start observing the document
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
