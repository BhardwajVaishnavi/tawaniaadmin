// Script to hide the loyalty program button
(function() {
  // Wait for React to finish hydration before making any changes
  setTimeout(() => {
    // Create a style element
    const style = document.createElement('style');

    // Add CSS rules to hide the loyalty program button
    style.textContent = `
      /* Hide the loyalty program button in the sidebar */
      a[href="/loyalty"] {
        visibility: hidden !important;
      }

      /* Also hide any parent li element if it only contains the loyalty program link */
      li[data-menu-item="loyalty"] {
        display: none !important;
      }
    `;

    // Append the style element to the document head
    document.head.appendChild(style);
  }, 1000); // Wait 1 second to ensure React has finished hydration
})();
