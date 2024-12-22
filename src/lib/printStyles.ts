export const injectPrintStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @media print {
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
      @page {
        margin: 20mm;
      }
    }
  `;
  document.head.appendChild(style);
};