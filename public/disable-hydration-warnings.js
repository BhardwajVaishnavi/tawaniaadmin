// Script to disable React's hydration warnings
(function() {
  // This function runs immediately
  function disableHydrationWarnings() {
    try {
      // Override console.error to suppress hydration warnings
      const originalConsoleError = console.error;
      console.error = function(...args) {
        // Check if this is a hydration warning
        const isHydrationWarning = args.some(arg => 
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
        
        // If this is a hydration warning, don't log it
        if (!isHydrationWarning) {
          originalConsoleError.apply(console, args);
        }
      };
      
      // Create a function to patch React's hydration code
      function patchReactDom() {
        // Check if React and ReactDOM are available
        if (window.React && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          // Try to patch React's hydration code
          try {
            // Get the React Fiber
            const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            const reactInstance = devTools.renderers.get(1);
            
            if (reactInstance && reactInstance.reconcilerVersion) {
              // This is React 18+
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
          } catch (error) {
            // Ignore errors
          }
        }
      }
      
      // Try to patch React's hydration code when the page loads
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchReactDom);
      } else {
        patchReactDom();
      }
      
      // Also try to patch React's hydration code after a short delay
      setTimeout(patchReactDom, 1000);
    } catch (error) {
      // Ignore errors
    }
  }
  
  // Run immediately
  disableHydrationWarnings();
})();
