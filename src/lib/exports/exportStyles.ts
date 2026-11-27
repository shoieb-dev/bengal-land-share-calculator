const ignoredControlSelector = "#export-controls, .print-hide, button, input, select, textarea, fieldset";

export function prepareExportClone(root: HTMLElement): void {
  root.querySelectorAll(ignoredControlSelector).forEach((element) => element.remove());

  root.style.boxSizing = "border-box";
  root.style.padding = "28px";
  root.style.backgroundColor = "#ffffff";
  root.style.color = "#0f172a";
  root.style.border = "1px solid #cbd5e1";
  root.style.borderRadius = "8px";
  root.style.boxShadow = "none";

  root.querySelectorAll<HTMLElement>("*").forEach((element) => {
    element.style.backgroundColor = "#ffffff";
    element.style.color = "#0f172a";
    element.style.opacity = "1";
    element.style.boxShadow = "none";
  });

  root.querySelectorAll<HTMLElement>("[data-export-grid]").forEach((grid) => {
    grid.style.display = "flex";
    grid.style.flexDirection = "row";
    grid.style.alignItems = "flex-start";
    grid.style.gap = "12px";

    Array.from(grid.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return;
      child.style.flex = "1 1 0";
      child.style.width = "auto";
      child.style.maxWidth = "none";
      child.style.minWidth = "0";
    });
  });

  root.querySelectorAll<HTMLElement>(".overflow-x-auto").forEach((wrapper) => {
    wrapper.style.overflow = "visible";
    wrapper.style.width = "100%";
  });

  root.querySelectorAll<HTMLElement>("table").forEach((table) => {
    table.style.width = "100%";
    table.style.border = "1px solid #cbd5e1";
    table.style.borderCollapse = "collapse";
    table.style.tableLayout = "auto";
  });

  root.querySelectorAll<HTMLElement>("th, td").forEach((cell) => {
    cell.style.border = "1px solid #cbd5e1";
    cell.style.padding = "5px 8px";
    cell.style.verticalAlign = "middle";
    cell.style.lineHeight = "1.4";
    cell.style.whiteSpace = "normal";
    cell.style.wordBreak = "break-word";
  });

  root.querySelectorAll<HTMLElement>("[data-export-comment]").forEach((comment) => {
    comment.style.padding = "4px 8px";
    comment.style.lineHeight = "1.4";
  });
}
