// This script fixes hydration mismatches by ensuring client and server rendering match
(function() {
  // Function to handle hydration mismatches
  function fixHydrationMismatches() {
    // Wait for the DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyFixes);
    } else {
      applyFixes();
    }
  }

  function applyFixes() {
    // Fix for the loyalty program menu item
    // Instead of hiding it with style={{display:"none"}}, we'll add a class
    // that will be consistent between server and client rendering
    const loyaltyMenuItem = document.querySelector('a[href="/loyalty"]');
    if (loyaltyMenuItem) {
      const listItem = loyaltyMenuItem.closest('li');
      if (listItem) {
        // Instead of modifying the style directly, add a class
        listItem.classList.add('loyalty-menu-item');
      }
    }
  }

  // Run the fix
  fixHydrationMismatches();
})();
