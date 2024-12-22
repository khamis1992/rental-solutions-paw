export const injectPrintStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      /* Hide non-printable elements */
      body * {
        visibility: hidden;
      }
      .print-content, .print-content * {
        visibility: visible;
      }
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }

      /* Ensure proper page breaks */
      h1, h2, h3 {
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      
      /* Improve readability */
      p, li {
        orphans: 3;
        widows: 3;
      }
      
      /* Set page margins */
      @page {
        margin: 20mm;
        size: A4;
      }

      /* Hide specific elements */
      .print:hidden {
        display: none !important;
      }

      /* Ensure proper content width */
      .container {
        max-width: 100% !important;
        width: 100% !important;
        padding: 0 !important;
      }

      /* Ensure all content is visible */
      .scroll-area {
        height: auto !important;
        overflow: visible !important;
      }

      /* Improve contrast for text */
      body {
        color: black !important;
        background: white !important;
      }

      /* Show all tab content when printing */
      [role="tabpanel"] {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
      }

      /* Add section titles when printing */
      [role="tabpanel"]::before {
        content: attr(aria-label);
        display: block;
        font-size: 24px;
        font-weight: bold;
        margin: 20px 0;
      }
    }
  `;
  document.head.appendChild(style);
};