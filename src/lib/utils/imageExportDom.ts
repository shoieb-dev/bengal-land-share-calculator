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

  // Use scale: 3 or 4 for higher resolution images
  const canvas = await html2canvas(element, {
    scale: 3,
    ignoreElements: (node) => {
      return node.id === "export-controls";
    },
  });
  return canvas;
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
