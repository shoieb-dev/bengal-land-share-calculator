export const exportAsImage = async (format: "png" | "jpg" = "png", fileName: string = `Khatian_${Date.now()}`) => {
  try {
    const html2canvas = (await import("html2canvas")).default;

    const element = document.getElementById("printable-area");

    if (!element) {
      console.error("Printable area not found");
      alert("ছবি তৈরি করতে সমস্যা হয়েছে");
      return;
    }

    // Create a completely new wrapper with clean styles
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      background: white;
      padding: 20px;
      font-family: 'Noto Sans Bengali', sans-serif;
    `;

    // Clone the content
    const clone = element.cloneNode(true) as HTMLElement;

    // Remove all class attributes to avoid Tailwind styles
    clone.querySelectorAll("*").forEach((el: Element) => {
      const htmlEl = el as HTMLElement;

      // Remove classes
      htmlEl.removeAttribute("class");

      // Set basic inline styles
      if (htmlEl.tagName === "TABLE") {
        htmlEl.style.cssText = "width: 100%; border-collapse: collapse; margin-bottom: 20px;";
      }
      if (htmlEl.tagName === "TH") {
        htmlEl.style.cssText =
          "background: #e5e7eb; color: black; padding: 8px; border: 1px solid #d1d5db; text-align: left; font-weight: bold;";
      }
      if (htmlEl.tagName === "TD") {
        htmlEl.style.cssText = "background: white; color: black; padding: 8px; border: 1px solid #d1d5db;";
      }
      if (htmlEl.tagName === "TR") {
        const parent = htmlEl.parentElement;
        if (parent?.tagName === "TBODY") {
          const index = Array.from(parent.children).indexOf(htmlEl);
          if (index % 2 === 0) {
            htmlEl.style.cssText = "background: #f9fafb;";
          }
        }
      }
      if (htmlEl.tagName === "H2" || htmlEl.tagName === "H3") {
        htmlEl.style.cssText = "color: black; margin: 10px 0; font-weight: bold;";
      }
      if (htmlEl.tagName === "BUTTON") {
        htmlEl.style.display = "none";
      }
    });

    // Set wrapper background
    clone.style.cssText = "background: white; color: black; padding: 20px; min-width: 800px;";

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Wait for render
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Capture the wrapper
    const canvas = await html2canvas(wrapper, {
      scale: 3,
      useCORS: false,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      windowWidth: 1200,
    });

    // Remove wrapper
    document.body.removeChild(wrapper);

    // Download
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("ছবি তৈরি করতে সমস্যা হয়েছে");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      `image/${format}`,
      format === "jpg" ? 0.95 : 1.0
    );
  } catch (error) {
    console.error("Image export error:", error);
    alert("ছবি তৈরি করতে সমস্যা হয়েছে");
  }
};

export const copyImageToClipboard = async () => {
  try {
    const html2canvas = (await import("html2canvas")).default;

    const element = document.getElementById("printable-area");
    if (!element) {
      alert("Content not found");
      return;
    }

    // Create clean wrapper
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      background: white;
      padding: 20px;
      font-family: 'Noto Sans Bengali', sans-serif;
    `;

    const clone = element.cloneNode(true) as HTMLElement;

    clone.querySelectorAll("*").forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      htmlEl.removeAttribute("class");

      if (htmlEl.tagName === "TABLE") {
        htmlEl.style.cssText = "width: 100%; border-collapse: collapse; margin-bottom: 20px;";
      }
      if (htmlEl.tagName === "TH") {
        htmlEl.style.cssText =
          "background: #e5e7eb; color: black; padding: 8px; border: 1px solid #d1d5db; font-weight: bold;";
      }
      if (htmlEl.tagName === "TD") {
        htmlEl.style.cssText = "background: white; color: black; padding: 8px; border: 1px solid #d1d5db;";
      }
      if (htmlEl.tagName === "BUTTON") {
        htmlEl.style.display = "none";
      }
    });

    clone.style.cssText = "background: white; color: black; padding: 20px; min-width: 800px;";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const canvas = await html2canvas(wrapper, {
      scale: 3,
      useCORS: false,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      windowWidth: 1200,
    });

    document.body.removeChild(wrapper);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        alert("ছবি ক্লিপবোর্ডে কপি হয়েছে!");
      } catch (err) {
        console.error("Clipboard error:", err);
        alert("ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে");
      }
    }, "image/png");
  } catch (error) {
    console.error("Copy error:", error);
    alert("ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে");
  }
};
