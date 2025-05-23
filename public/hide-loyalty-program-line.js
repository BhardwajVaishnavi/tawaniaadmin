// Script to hide the "Loyalty Program: Default Loyalty Program" line in the customer pages
(function() {
  function hideLoyaltyProgramLine() {
    // Method 1: Hide the standalone "Loyalty Program: Default Loyalty Program" line in the customers list page
    const loyaltyProgramLines = document.querySelectorAll('div.space-y-6 > div');

    loyaltyProgramLines.forEach(element => {
      if (element.textContent &&
          element.textContent.trim() === 'Loyalty Program: Default Loyalty Program') {
        element.style.display = 'none';
      }
    });

    // Method 2: Hide any text that contains "Loyalty Program: Default Loyalty Program"
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element.childNodes.length === 1 &&
          element.childNodes[0].nodeType === Node.TEXT_NODE &&
          element.textContent.trim() === 'Loyalty Program: Default Loyalty Program') {
        element.style.display = 'none';
      }
    });

    // Method 3: Hide the loyalty program overview component if it contains "Default Loyalty Program"
    const loyaltyProgramComponents = document.querySelectorAll('.rounded-lg.bg-white.p-6.shadow-md');

    loyaltyProgramComponents.forEach(element => {
      const heading = element.querySelector('h2');
      if (heading &&
          heading.textContent.includes('Loyalty Program:') &&
          heading.textContent.includes('Default Loyalty Program')) {
        // Only hide the heading, not the entire component
        heading.style.display = 'none';
      }
    });
  }

  // Run the function when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideLoyaltyProgramLine);
  } else {
    hideLoyaltyProgramLine();
  }

  // Also run it after a short delay to catch any dynamically added content
  setTimeout(hideLoyaltyProgramLine, 500);

  // Run it periodically to catch any dynamically added content
  setInterval(hideLoyaltyProgramLine, 1000);
})();
