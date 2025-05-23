// Script to modify the sidebar component to prevent hydration mismatches
(function() {
  function fixSidebarComponent() {
    try {
      // Wait for React to be loaded
      const checkReact = setInterval(() => {
        if (window.React) {
          clearInterval(checkReact);
          
          // Monkey patch React.createElement to prevent problematic attributes
          const originalCreateElement = React.createElement;
          React.createElement = function(type, props, ...children) {
            // Check if this is a loyalty-related element
            if (props && typeof props === 'object') {
              // Check if this is an anchor with href="/loyalty"
              if (type === 'a' && props.href === '/loyalty') {
                // Remove any style prop that might cause hydration mismatches
                if (props.style) {
                  delete props.style;
                }
              }
              
              // Check if this is a li element with data-menu-item="loyalty"
              if (type === 'li' && props['data-menu-item'] === 'loyalty') {
                // Remove the data-menu-item prop
                delete props['data-menu-item'];
              }
              
              // Check if this is a li element with className containing "loyalty-menu-item"
              if (type === 'li' && props.className && typeof props.className === 'string' && 
                  props.className.includes('loyalty-menu-item')) {
                // Remove the loyalty-menu-item class
                props.className = props.className.replace('loyalty-menu-item', '').trim();
                
                // If className is now empty, delete it
                if (!props.className) {
                  delete props.className;
                }
              }
            }
            
            // Call the original createElement function
            return originalCreateElement(type, props, ...children);
          };
        }
      }, 100);
    } catch (error) {
      console.error('Error in fixSidebarComponent:', error);
    }
  }
  
  // Run when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixSidebarComponent);
  } else {
    fixSidebarComponent();
  }
})();
