export const injectPrintStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      /* Hide everything except the invoice content */
      body > *:not(.print-content) {
        display: none !important;
      }
      
      .print-content {
        display: block !important;
        position: relative !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Reset any scroll areas */
      .scroll-area {
        height: auto !important;
        overflow: visible !important;
      }

      /* Remove card styling for clean print */
      .card {
        box-shadow: none !important;
        border: none !important;
      }

      /* Ensure proper page breaks */
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      thead { display: table-header-group; }

      /* Set page margins */
      @page {
        margin: 20mm;
        size: A4;
      }

      /* Improve text contrast for printing */
      body {
        color: black !important;
        background: white !important;
      }

      /* Hide print button and other UI elements */
      .print\\:hidden {
        display: none !important;
      }

      /* Adjust spacing for print */
      .space-y-4 {
        margin-top: 1rem !important;
        margin-bottom: 1rem !important;
      }

      /* Ensure tables are properly formatted */
      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }

      th, td {
        padding: 0.5rem !important;
        text-align: left !important;
      }

      /* Ensure proper image sizing */
      img {
        max-width: 100% !important;
        height: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
};