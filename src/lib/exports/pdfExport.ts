// src/lib/exports/pdfExport.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toBengaliNumber } from "@/lib/conversions/numberConversion";

const targetElementId = "printable-area";

/**
 * Normalizes any CSS color (including modern oklch()/lab()/lch() functions
 * that Tailwind v4 uses by default) into a plain rgb()/rgba() string that
 * html2canvas can parse. Uses the Canvas 2D API's color serialization,
 * which always resolves to rgb-space regardless of the input format.
 */
function toRGB(color: string): string {
  if (!color || color === "transparent") return color;
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return color;
    ctx.fillStyle = "#000"; // reset to a known-safe baseline first
    ctx.fillStyle = color;
    return ctx.fillStyle;
  } catch {
    return color;
  }
}

/**
 * Walks every element in the subtree and bakes its resolved computed
 * color (background, text, border) into an inline style as plain rgb(),
 * overriding any oklch()/lab() values coming from Tailwind v4 classes.
 * Also strips gradients/box-shadows, which can carry the same unsupported
 * color functions.
 */
function flattenColors(root: HTMLElement) {
  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];

  elements.forEach((el) => {
    const computed = window.getComputedStyle(el);

    el.style.backgroundColor = toRGB(computed.backgroundColor);
    el.style.color = toRGB(computed.color);
    el.style.borderTopColor = toRGB(computed.borderTopColor);
    el.style.borderRightColor = toRGB(computed.borderRightColor);
    el.style.borderBottomColor = toRGB(computed.borderBottomColor);
    el.style.borderLeftColor = toRGB(computed.borderLeftColor);
    el.style.outlineColor = toRGB(computed.outlineColor);

    // Gradients and shadows can also embed oklch()/lab() stops/colors
    if (computed.backgroundImage && computed.backgroundImage !== "none") {
      el.style.backgroundImage = "none";
    }
    el.style.boxShadow = "none";

    // html2canvas doesn't reliably replicate the browser's implicit default
    // of vertically centering <td>/<th> content, since it re-implements
    // table layout in JS rather than using the browser's real table engine.
    // Baking the resolved value in explicitly avoids it falling back to top.
    if (el.tagName === "TD" || el.tagName === "TH") {
      el.style.verticalAlign =
        computed.verticalAlign && computed.verticalAlign !== "baseline" ? computed.verticalAlign : "middle";
    }
  });
}

/**
 * Draws a centered "পাতা X এর Y" footer directly onto a page canvas using
 * real Canvas 2D text rendering (which respects the Noto Sans Bengali font
 * already loaded via globals.css). This is used instead of jsPDF's own
 * pdf.text(), because jsPDF's built-in fonts don't support Bengali glyphs.
 */
function drawPageFooter(
  ctx: CanvasRenderingContext2D,
  canvasWidthPx: number,
  footerTopPx: number,
  footerHeightPx: number,
  pageNum: number,
  totalPages: number,
) {
  const label = `পাতা ${toBengaliNumber(totalPages)} এর ${toBengaliNumber(pageNum)}`;

  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, footerTopPx, canvasWidthPx, footerHeightPx);

  ctx.fillStyle = "#4b5563"; // gray-600
  const fontSizePx = Math.round(footerHeightPx * 0.4);
  ctx.font = `${fontSizePx}px "Noto Sans Bengali", "Kalpurush", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, canvasWidthPx / 2, footerTopPx + footerHeightPx / 2);
  ctx.restore();
}

interface PlanItem {
  kind: "atomic" | "theadGroup" | "tableRow";
  node?: HTMLElement; // for atomic / tableRow
  headingNode?: HTMLElement | null; // for theadGroup
  theadNode?: HTMLElement | null; // for theadGroup / tableRow
  tableRef?: HTMLTableElement; // for theadGroup / tableRow
  height: number;
}

/**
 * Walks the direct children of `root` and builds a flat measurement plan.
 * Any child containing a <table> is decomposed into a "theadGroup" (an
 * optional preceding heading + the <thead>) followed by one item per
 * <tbody> row, so pagination can happen at row granularity instead of
 * blindly slicing a flattened image.
 */
function buildPlan(root: HTMLElement): PlanItem[] {
  const items: PlanItem[] = [];
  const topChildren = Array.from(root.children) as HTMLElement[];

  for (const child of topChildren) {
    const table = child.tagName === "TABLE" ? (child as unknown as HTMLTableElement) : child.querySelector("table");

    if (!table) {
      items.push({ kind: "atomic", node: child, height: child.getBoundingClientRect().height });
      continue;
    }

    // If the immediately preceding item is a heading, merge it with this table's thead
    let headingNode: HTMLElement | null = null;
    const prev = items[items.length - 1];
    if (prev && prev.kind === "atomic" && prev.node && /^H[1-6]$/.test(prev.node.tagName)) {
      headingNode = prev.node;
      items.pop();
    }

    const thead = table.querySelector("thead") as HTMLElement | null;
    const tbody = table.querySelector("tbody");
    const headingHeight = headingNode ? headingNode.getBoundingClientRect().height : 0;
    const theadHeight = thead ? thead.getBoundingClientRect().height : 0;

    items.push({
      kind: "theadGroup",
      headingNode,
      tableRef: table,
      theadNode: thead,
      height: headingHeight + theadHeight,
    });

    if (tbody) {
      Array.from(tbody.children).forEach((tr) => {
        items.push({
          kind: "tableRow",
          node: tr as HTMLElement,
          tableRef: table,
          theadNode: thead,
          height: (tr as HTMLElement).getBoundingClientRect().height,
        });
      });
    }
  }

  return items;
}

/**
 * Merges any run of consecutive standalone "atomic" items (e.g. the title,
 * address block, and section heading that precede the first table) into a
 * single combined block. Without this, pagination could split the title
 * onto one page and the address details onto the next, since each was
 * being treated as an independently breakable item.
 */
function mergeConsecutiveAtomics(items: PlanItem[]): PlanItem[] {
  const merged: PlanItem[] = [];
  let i = 0;

  while (i < items.length) {
    if (items[i].kind === "atomic") {
      const runNodes: HTMLElement[] = [];
      let runHeight = 0;
      while (i < items.length && items[i].kind === "atomic") {
        runNodes.push(items[i].node!);
        runHeight += items[i].height;
        i++;
      }
      if (runNodes.length === 1) {
        merged.push({ kind: "atomic", node: runNodes[0], height: runHeight });
      } else {
        const wrapper = document.createElement("div");
        runNodes.forEach((n) => wrapper.appendChild(n.cloneNode(true)));
        merged.push({ kind: "atomic", node: wrapper, height: runHeight });
      }
    } else {
      merged.push(items[i]);
      i++;
    }
  }

  return merged;
}

/** Splits a flat plan into pages, repeating a table's thead whenever a row overflows onto a new page. */
function paginate(items: PlanItem[], maxHeightPx: number): PlanItem[][] {
  const pages: PlanItem[][] = [[]];
  let currentHeight = 0;

  for (const item of items) {
    if (currentHeight + item.height > maxHeightPx && currentHeight > 0) {
      pages.push([]);
      currentHeight = 0;

      if (item.kind === "tableRow" && item.theadNode) {
        const contHeadHeight = item.theadNode.getBoundingClientRect().height;
        pages[pages.length - 1].push({
          kind: "theadGroup",
          headingNode: null,
          tableRef: item.tableRef,
          theadNode: item.theadNode,
          height: contHeadHeight,
        });
        currentHeight += contHeadHeight;
      }
    }
    pages[pages.length - 1].push(item);
    currentHeight += item.height;
  }

  return pages;
}

/** Rebuilds a standalone, off-screen DOM tree containing exactly one page's worth of content. */
function buildPageRoot(rootTemplate: HTMLElement, pageItems: PlanItem[]): HTMLElement {
  const pageRoot = rootTemplate.cloneNode(false) as HTMLElement;
  pageRoot.removeAttribute("id");

  let i = 0;
  while (i < pageItems.length) {
    const it = pageItems[i];

    if (it.kind === "atomic" && it.node) {
      pageRoot.appendChild(it.node.cloneNode(true));
      i++;
    } else if (it.kind === "theadGroup" && it.tableRef) {
      if (it.headingNode) pageRoot.appendChild(it.headingNode.cloneNode(true));

      const tableClone = it.tableRef.cloneNode(false) as HTMLTableElement;
      if (it.theadNode) tableClone.appendChild(it.theadNode.cloneNode(true));

      const origTbody = it.tableRef.querySelector("tbody");
      const tbodyClone = document.createElement("tbody");
      if (origTbody) tbodyClone.className = origTbody.className;
      tableClone.appendChild(tbodyClone);

      i++;
      while (i < pageItems.length && pageItems[i].kind === "tableRow" && pageItems[i].tableRef === it.tableRef) {
        tbodyClone.appendChild(pageItems[i].node!.cloneNode(true));
        i++;
      }

      const origWrapper = it.tableRef.parentElement;
      const wrapperClone = origWrapper ? (origWrapper.cloneNode(false) as HTMLElement) : document.createElement("div");
      wrapperClone.appendChild(tableClone);
      pageRoot.appendChild(wrapperClone);
    } else {
      i++;
    }
  }

  return pageRoot;
}

/**
 * Generates a downloadable, table-aware, multi-page PDF from #printable-area.
 * Unlike naive canvas slicing, this measures actual row heights and paginates
 * at row boundaries — so a table's <thead> repeats on every page it spans,
 * and pages don't end up mostly blank because a slice cut through whitespace.
 */
export async function downloadPDF(fileName: string = `Khatian_${Date.now()}`): Promise<void> {
  const element = document.getElementById(targetElementId);
  if (!element) {
    console.error(`Element with ID '${targetElementId}' not found.`);
    alert("PDF তৈরি করতে সমস্যা হয়েছে");
    return;
  }

  const exportWidth = 1000;
  const scale = 2;

  const measureRoot = element.cloneNode(true) as HTMLElement;
  measureRoot.style.position = "absolute";
  measureRoot.style.left = "-9999px";
  measureRoot.style.top = "0";
  measureRoot.style.width = `${exportWidth}px`;
  measureRoot.style.minWidth = `${exportWidth}px`;
  measureRoot.style.background = "#ffffff";
  measureRoot.style.color = "#000000";

  measureRoot.querySelectorAll("#export-controls, button").forEach((el) => el.remove());
  document.body.appendChild(measureRoot);

  const pageRoots: HTMLElement[] = [];

  try {
    flattenColors(measureRoot);
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 100));

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const footerHeightMM = 8;
    const usableWidthMM = pageWidth - margin * 2;
    const usableContentHeightMM = pageHeight - margin * 2 - footerHeightMM;

    const basePxPerMM = exportWidth / usableWidthMM;

    // The card's own padding + border add vertical space that no individual
    // content item accounts for (each item is measured inside the padded
    // box, not including the box's own chrome). Since every rebuilt page
    // reuses the same card classes, this chrome repeats on every page and
    // must be subtracted from the available content height.
    const cardStyle = window.getComputedStyle(measureRoot);
    const verticalChromePx =
      parseFloat(cardStyle.paddingTop || "0") +
      parseFloat(cardStyle.paddingBottom || "0") +
      parseFloat(cardStyle.borderTopWidth || "0") +
      parseFloat(cardStyle.borderBottomWidth || "0");

    // Small fixed cushion for things that are hard to measure exactly:
    // box-shadow bleed, and sub-pixel rounding between getBoundingClientRect
    // (measurement time) and html2canvas's actual re-render at `scale`x.
    const safetyPaddingPx = 100;

    const maxHeightPx = usableContentHeightMM * basePxPerMM - verticalChromePx - safetyPaddingPx;

    const plan = mergeConsecutiveAtomics(buildPlan(measureRoot));
    const pages = paginate(plan, maxHeightPx);
    const totalPages = pages.length;

    for (let p = 0; p < pages.length; p++) {
      const pageRoot = buildPageRoot(measureRoot, pages[p]);
      pageRoots.push(pageRoot);
      document.body.appendChild(pageRoot);

      const pageCanvas = await html2canvas(pageRoot, {
        scale,
        width: exportWidth,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      let finalCanvas = pageCanvas;

      if (totalPages > 1) {
        const scalePxPerMM = pageCanvas.width / usableWidthMM;
        const footerHeightPx = footerHeightMM * scalePxPerMM;

        const composite = document.createElement("canvas");
        composite.width = pageCanvas.width;
        composite.height = pageCanvas.height + footerHeightPx;
        const ctx = composite.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, composite.width, composite.height);
          ctx.drawImage(pageCanvas, 0, 0);
          drawPageFooter(ctx, composite.width, pageCanvas.height, footerHeightPx, p + 1, totalPages);
          finalCanvas = composite;
        }
      }

      const imgHeightMM = (finalCanvas.height * usableWidthMM) / finalCanvas.width;
      if (p > 0) pdf.addPage();
      pdf.addImage(finalCanvas.toDataURL("image/png"), "PNG", margin, margin, usableWidthMM, imgHeightMM);

      document.body.removeChild(pageRoot);
      pageRoots.pop();
    }

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("PDF তৈরি করতে সমস্যা হয়েছে");
  } finally {
    pageRoots.forEach((pr) => pr.parentElement && document.body.removeChild(pr));
    document.body.removeChild(measureRoot);
  }
}
