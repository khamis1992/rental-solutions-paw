export const printStyles = `
  @page {
    size: A4;
    margin: 20mm;
  }

  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
    }

    /* Hide navigation elements */
    nav, 
    header,
    .print\:hidden {
      display: none !important;
    }

    /* Show all content when printing */
    [role="tabpanel"] {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 2rem;
    }

    /* Show section titles for print */
    .print-only {
      display: block !important;
    }

    /* Ensure proper page breaks */
    .print-section {
      break-before: page;
    }

    /* Adjust typography for print */
    h1 {
      font-size: 24pt;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 20pt;
      margin-bottom: 0.8rem;
    }

    h3 {
      font-size: 16pt;
      margin-bottom: 0.6rem;
    }

    p, li {
      font-size: 11pt;
      line-height: 1.4;
    }

    /* Ensure cards break properly */
    .card {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 1rem;
    }

    /* Table styles for print */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    th, td {
      padding: 8pt;
      text-align: left;
      border-bottom: 1pt solid #ddd;
    }

    /* Image handling */
    img {
      max-width: 100%;
      height: auto;
      break-inside: avoid;
    }
  }
`;

export const injectPrintStyles = () => {
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
  window.print();
  document.head.removeChild(style);
};