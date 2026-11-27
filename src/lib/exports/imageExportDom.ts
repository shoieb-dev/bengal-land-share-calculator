// src/lib/exports/imageExportDom.ts
import html2canvas from "html2canvas";
import { showToast } from "@/lib/utils/toast";
import { prepareExportClone } from "./exportStyles";

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

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = `${exportWidth}px`;
  clone.style.minWidth = `${exportWidth}px`;
  clone.style.boxSizing = "border-box";
  prepareExportClone(clone);

  document.body.appendChild(clone);

  clone.querySelectorAll<HTMLElement>("table").forEach((table) => {
    table.style.fontSize = isMobile ? "12px" : "14px";
  });

  try {
    await document.fonts.ready;
    const canvas = await html2canvas(clone, {
      scale: 2,
      width: exportWidth,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
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
export async function downloadImage(format: "png" | "jpeg", fileName: string = "Khatiyan-Result"): Promise<void> {
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const extension = format === "png" ? "png" : "jpg";

  try {
    const canvas = await generateCanvas();
    const imageURL = canvas.toDataURL(mimeType, 1.0); // 1.0 is max quality

    const a = document.createElement("a");
    a.href = imageURL;
    a.download = `${fileName}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Image download failed:", error);
    showToast("ছবি ডাউনলোড ব্যর্থ হয়েছে।", "error");
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
        showToast("ফলাফল ক্লিপবোর্ডে কপি করা হয়েছে।", "success");
      } else {
        showToast("আপনার ব্রাউজার ক্লিপবোর্ডে ছবি কপি সমর্থন করে না।", "error");
      }
    }, "image/png"); // Copy as PNG for best quality/transparency
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    showToast("ক্লিপবোর্ডে কপি করা ব্যর্থ হয়েছে।", "error");
  }
}
