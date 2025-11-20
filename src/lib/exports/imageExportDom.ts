// src/lib/utils/imageExport.ts
import html2canvas from "html2canvas";

const targetElementId = "printable-area";

/**
 * Generates a canvas from the target element.
 * @returns {Promise<HTMLCanvasElement>} The canvas element.
 */
async function generateCanvas(): Promise<HTMLCanvasElement> {
  const element = document.getElementById(targetElementId);
  if (!element) {
    throw new Error(`Element with ID '${targetElementId}' not found.`);
  }

  // Detect if mobile
  const isMobile = window.innerWidth < 768;
  const exportWidth = isMobile ? 800 : 1000; // Wider on desktop
  const scale = isMobile ? 2 : 3; // Lower scale on mobile for performance

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = `${exportWidth}px`;
  clone.style.minWidth = `${exportWidth}px`;

  document.body.appendChild(clone);

  // Apply styles
  const tables = clone.querySelectorAll("table");
  tables.forEach((table: Element) => {
    const htmlTable = table as HTMLElement;
    htmlTable.style.borderCollapse = "collapse";
    htmlTable.style.width = "100%";
    htmlTable.style.fontSize = isMobile ? "12px" : "14px";
  });

  const cells = clone.querySelectorAll("td, th");
  cells.forEach((cell: Element) => {
    const htmlCell = cell as HTMLElement;
    htmlCell.style.verticalAlign = "middle";
    htmlCell.style.padding = isMobile ? "6px" : "8px";
    htmlCell.style.wordWrap = "break-word";
  });

  try {
    const canvas = await html2canvas(clone, {
      scale: scale,
      width: exportWidth,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      ignoreElements: (node) => {
        return node.id === "export-controls";
      },
    });

    document.body.removeChild(clone);
    return canvas;
  } catch (error) {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
    throw error;
  }
}

/**
 * Downloads the content as an image (PNG or JPEG).
 * @param {string} format 'image/png' or 'image/jpeg'
 */
export async function downloadImage(format: "png" | "jpeg"): Promise<void> {
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const extension = format === "png" ? "png" : "jpg";

  try {
    const canvas = await generateCanvas();
    const imageURL = canvas.toDataURL(mimeType, 1.0); // 1.0 is max quality

    const a = document.createElement("a");
    a.href = imageURL;
    a.download = `khatiyan-result-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Image download failed:", error);
    alert("ছবি ডাউনলোড ব্যর্থ হয়েছে।");
  }
}

/**
 * Copies the content as an image to the clipboard.
 */
export async function copyImageToClipboard(): Promise<void> {
  try {
    const canvas = await generateCanvas();

    // Convert canvas to a Blob object
    canvas.toBlob(async (blob) => {
      if (blob && navigator.clipboard) {
        // Write the blob to the clipboard as an image item
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        alert("ফলাফল ক্লিপবোর্ডে কপি করা হয়েছে।");
      } else {
        alert("আপনার ব্রাউজার ক্লিপবোর্ডে ছবি কপি সমর্থন করে না।");
      }
    }, "image/png"); // Copy as PNG for best quality/transparency
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    alert("ক্লিপবোর্ডে কপি করা ব্যর্থ হয়েছে।");
  }
}
