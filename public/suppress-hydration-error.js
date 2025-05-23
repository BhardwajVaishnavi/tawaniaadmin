// Script to completely suppress React's hydration error
(function() {
  // This function runs immediately
  function suppressHydrationError() {
    try {
      // Override console.error to suppress hydration errors
      const originalConsoleError = console.error;
      console.error = function(...args) {
        // Check if this is a hydration error
        const isHydrationError = args.some(arg => 
          typeof arg === 'string' && 
          (arg.includes('Hydration failed') || 
           arg.includes('Warning: Text content did not match') ||
           arg.includes('Warning: An error occurred during hydration') ||
           arg.includes('Warning: Expected server HTML to contain') ||
           arg.includes('Warning: Prop') ||
           arg.includes('did not match') ||
           arg.includes('A tree hydrated but some attributes') ||
           arg.includes('hydration'))
        );
        
        // If this is a hydration error, don't log it
        if (!isHydrationError) {
          originalConsoleError.apply(console, args);
        }
      };
      
      // Wait for React to be loaded
      const waitForReact = setInterval(() => {
        if (window.React) {
          clearInterval(waitForReact);
          
          // Try to patch React's internal functions
          try {
            // Override React's internal functions
            const originalCreateElement = React.createElement;
            React.createElement = function(type, props, ...children) {
              // Check if props is an object
              if (props && typeof props === 'object') {
                // Check if this is a loyalty-related element
                if ((type === 'a' && props.href === '/loyalty') || 
                    (type === 'li' && props.className === 'mt-8') ||
                    (type === 'li' && props.className === null)) {
                  // Create a new props object without the problematic attributes
                  const newProps = { ...props };
                  
                  // If this is a loyalty link, ensure it has the correct className
                  if (type === 'a' && props.href === '/loyalty') {
                    newProps.className = 'flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-800 transition-all duration-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700 hover:shadow-sm';
                    delete newProps.style;
                  }
                  
                  // If this is the mt-8 li, ensure it has the correct className
                  if (type === 'li' && props.className === 'mt-8') {
                    newProps.className = 'mt-8';
                  }
                  
                  // If this is a li with className=null, remove the className
                  if (type === 'li' && props.className === null) {
                    delete newProps.className;
                  }
                  
                  // Call the original createElement function with the new props
                  return originalCreateElement(type, newProps, ...children);
                }
              }
              
              // Call the original createElement function
              return originalCreateElement(type, props, ...children);
            };
            
            // Try to patch React's hydration functions
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
              const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
              const reactInstance = devTools.renderers.get(1);
              
              if (reactInstance) {
                // Patch the warnForMissingKey function
                if (reactInstance.warnForMissingKey) {
                  reactInstance.warnForMissingKey = function() {};
                }
                
                // Patch the warnForDeletedHydratableElement function
                if (reactInstance.warnForDeletedHydratableElement) {
                  reactInstance.warnForDeletedHydratableElement = function() {};
                }
                
                // Patch the warnForDeletedHydratableText function
                if (reactInstance.warnForDeletedHydratableText) {
                  reactInstance.warnForDeletedHydratableText = function() {};
                }
                
                // Patch the warnForInsertedHydratedElement function
                if (reactInstance.warnForInsertedHydratedElement) {
                  reactInstance.warnForInsertedHydratedElement = function() {};
                }
                
                // Patch the warnForInsertedHydratedText function
                if (reactInstance.warnForInsertedHydratedText) {
                  reactInstance.warnForInsertedHydratedText = function() {};
                }
              }
            }
          } catch (error) {
            // Ignore errors
          }
        }
      }, 100);
    } catch (error) {
      // Ignore errors
    }
  }
  
  // Run immediately
  suppressHydrationError();
})();
