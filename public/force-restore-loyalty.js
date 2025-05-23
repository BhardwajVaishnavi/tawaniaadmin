// Script to force restore the loyalty program button by modifying the DOM directly
(function() {
  // This function runs immediately to ensure the loyalty button is visible
  function forceRestoreLoyaltyButton() {
    try {
      // Create a style element to override any CSS that might be hiding the loyalty button
      const style = document.createElement('style');
      style.textContent = `
        /* Force show the loyalty button */
        a[href="/loyalty"],
        li[data-menu-item="loyalty"],
        nav ul li a[href="/loyalty"],
        nav ul li[data-menu-item="loyalty"] {
          display: list-item !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(style);
      
      // Create a MutationObserver to watch for changes to the DOM
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' || mutation.type === 'childList') {
            // Check if the loyalty button or its parent has been hidden
            const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
            loyaltyLinks.forEach(link => {
              // Make sure the link is visible
              link.style.display = '';
              link.style.visibility = 'visible';
              
              // Find the parent li element
              const parentLi = link.closest('li');
              if (parentLi) {
                // Make sure the li is visible
                parentLi.style.display = '';
                parentLi.style.visibility = 'visible';
              }
            });
          }
        });
      });
      
      // Start observing the document
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    } catch (error) {
      console.error('Error in forceRestoreLoyaltyButton:', error);
    }
  }
  
  // Run immediately
  forceRestoreLoyaltyButton();
})();
