export const generatePDFSimple = async (referenceNo: string = `KH-${Date.now()}`) => {
  try {
    const jsPDF = (await import("jspdf")).default;
    const html2canvas = (await import("html2canvas")).default;

    const element = document.getElementById("printable-area");

    if (!element) {
      console.error("Printable area not found");
      return;
    }

    // Store original styles to restore later
    const originalStyles = new Map<Element, string>();

    // Get all elements and force simple colors
    const allElements = element.querySelectorAll("*");
    allElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;

      // Save original style
      originalStyles.set(el, htmlEl.getAttribute("style") || "");

      // Get current inline style
      const currentStyle = htmlEl.getAttribute("style") || "";

      // Add color overrides
      htmlEl.setAttribute(
        "style",
        `
        ${currentStyle}
        background-image: none !important;
        background-color: ${htmlEl.tagName === "TH" ? "#e5e7eb" : "white"} !important;
        color: black !important;
        border-color: #e5e7eb !important;
      `
      );
    });

    // Also add inline styles to main element
    const mainOriginalStyle = element.getAttribute("style") || "";
    element.setAttribute(
      "style",
      `
      ${mainOriginalStyle}
      background-color: white !important;
      color: black !important;
    `
    );

    // Wait a bit for styles to apply
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create canvas from HTML
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
    });

    // Restore original styles
    allElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const originalStyle = originalStyles.get(el);
      if (originalStyle) {
        htmlEl.setAttribute("style", originalStyle);
      } else {
        htmlEl.removeAttribute("style");
      }
    });

    // Restore main element style
    if (mainOriginalStyle) {
      element.setAttribute("style", mainOriginalStyle);
    } else {
      element.removeAttribute("style");
    }

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const imgWidthMM = pdfWidth - 20;
    const imgHeightMM = (imgHeight * imgWidthMM) / imgWidth;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidthMM, imgHeightMM);

    pdf.save(`Khatian_${referenceNo}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("PDF তৈরি করতে সমস্যা হয়েছে");
  }
};
