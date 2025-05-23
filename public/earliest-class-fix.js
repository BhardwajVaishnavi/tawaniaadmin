// Script to fix className issues as early as possible
(function() {
  // This function runs immediately
  function earliestClassFix() {
    try {
      // Define the correct className for loyalty links
      const correctLoyaltyLinkClass = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700 hover:shadow-sm';
      
      // Create a function to fix className issues
      function fixClassNames() {
        // Find all loyalty links
        const loyaltyLinks = document.querySelectorAll('a[href="/loyalty"]');
        
        // Process each loyalty link
        loyaltyLinks.forEach(link => {
          // Check if the className is null or incorrect
          if (link.className === null || link.className === 'null' || link.className === '') {
            // Set the correct className
            link.className = correctLoyaltyLinkClass;
          }
        });
        
        // Find all li elements with className=""
        const emptyClassLiElements = document.querySelectorAll('li[class=""]');
        
        // Process each empty class li element
        emptyClassLiElements.forEach(li => {
          // Remove the className attribute
          li.removeAttribute('class');
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
      }
      
      // Create a MutationObserver to watch for DOM changes
      const observer = new MutationObserver((mutations) => {
        // Run the fixClassNames function after each mutation
        fixClassNames();
      });
      
      // Start observing the document
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
      
      // Run the fixClassNames function immediately
      fixClassNames();
    } catch (error) {
      console.error('Error in earliestClassFix:', error);
    }
  }
  
  // Run immediately
  earliestClassFix();
})();
