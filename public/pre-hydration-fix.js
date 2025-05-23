// Script to fix hydration mismatches by running before React hydration
(function() {
  // This needs to run synchronously before React hydration starts
  try {
    // Fix for the li element with missing attributes in the sidebar
    const sidebarItems = document.querySelectorAll('li');
    sidebarItems.forEach(item => {
      // Check if this might be the loyalty menu item
      if (item.textContent && item.textContent.includes('Loyalty')) {
        // Ensure consistent attributes
        if (item.getAttribute('data-menu-item') === 'loyalty') {
          // If it has the data attribute but is missing class or style, add them
          if (!item.hasAttribute('class')) {
            item.setAttribute('class', '');
          }
        }
        // Remove any style attribute to avoid mismatch
        item.removeAttribute('style');
      }
    });

    // Fix for the h2 element with style={{display:"none"}}
    const headings = document.querySelectorAll('h2');
    headings.forEach(heading => {
      if (heading.textContent && heading.textContent.includes('Loyalty Program:')) {
        // Remove the style attribute to avoid hydration mismatch
        heading.removeAttribute('style');
        
        // Add a class that we'll hide with CSS after hydration
        heading.classList.add('hide-after-hydration');
        
        // Find the parent element that might be the loyalty program line
        let parent = heading.parentElement;
        while (parent && !parent.classList.contains('space-y-6')) {
          if (parent.textContent.trim() === 'Loyalty Program: Default Loyalty Program') {
            // Add a class to hide this element with CSS
            parent.classList.add('hide-loyalty-program');
            break;
          }
          parent = parent.parentElement;
        }
      }
    });

    // Fix for the standalone loyalty program line
    const divs = document.querySelectorAll('div');
    divs.forEach(div => {
      if (div.textContent && 
          div.textContent.trim() === 'Loyalty Program: Default Loyalty Program' &&
          !div.querySelector('h2')) {
        // Add a class to hide this element with CSS
        div.classList.add('hide-loyalty-program');
      }
    });

    // Create a style element to hide elements with our special classes
    const style = document.createElement('style');
    style.textContent = `
      .hide-after-hydration,
      .hide-loyalty-program {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  } catch (error) {
    console.error('Error in pre-hydration fix:', error);
  }
})();
