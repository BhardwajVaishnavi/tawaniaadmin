// Script to fix hydration mismatches
(function() {
  // This function runs before React hydration to ensure server and client HTML match
  function fixHydrationMismatches() {
    try {
      // Fix 1: Remove inline styles from h2 elements in LoyaltyProgramOverview
      // Instead of adding style={{display:"none"}} which causes hydration mismatch,
      // we'll use a class that will be applied after hydration
      const loyaltyHeadings = document.querySelectorAll('.rounded-lg.bg-white.p-6.shadow-md h2');
      loyaltyHeadings.forEach(heading => {
        if (heading.textContent && heading.textContent.includes('Loyalty Program:')) {
          // Remove any inline style that might be causing hydration mismatch
          heading.removeAttribute('style');
          
          // Add a class that we'll target with CSS after hydration
          heading.classList.add('hide-after-hydration');
        }
      });

      // Fix 2: Fix the li element with missing attributes
      const sidebarItems = document.querySelectorAll('nav ul li');
      sidebarItems.forEach(item => {
        // Look for the loyalty menu item
        const link = item.querySelector('a[href="/loyalty"]');
        if (link) {
          // Ensure consistent attributes between server and client
          if (!item.hasAttribute('data-menu-item')) {
            item.setAttribute('data-menu-item', 'loyalty');
          }
          if (!item.hasAttribute('class')) {
            item.setAttribute('class', '');
          }
          // Remove any style attribute to avoid mismatch
          item.removeAttribute('style');
        }
      });

      // Create a style element to hide elements after hydration
      const style = document.createElement('style');
      style.textContent = `
        /* Hide loyalty program heading after hydration */
        .hide-after-hydration {
          display: none !important;
        }
        
        /* Hide the standalone loyalty program line */
        div:not(.rounded-lg):not(.flex):empty + div:not(.rounded-lg):not(.flex) {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    } catch (error) {
      console.error('Error in fixHydrationMismatches:', error);
    }
  }

  // Run immediately to fix the DOM before React hydration
  fixHydrationMismatches();

  // Also run when DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixHydrationMismatches);
  }
})();
