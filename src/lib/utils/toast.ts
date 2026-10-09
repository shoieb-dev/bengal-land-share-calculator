export type ToastTone = "success" | "error" | "info";

export type ToastPayload = {
  message: string;
  tone: ToastTone;
  duration?: number;
};

const TOAST_EVENT = "khatiyan-toast";

export const showToast = (message: string, tone: ToastTone = "info", duration = 2600) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: { message, tone, duration },
    })
  );
};

export const subscribeToToast = (callback: (toast: ToastPayload) => void) => {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const detail = (event as CustomEvent<ToastPayload>).detail;
    if (detail) callback(detail);
  };

  window.addEventListener(TOAST_EVENT, handler);
  return () => window.removeEventListener(TOAST_EVENT, handler);
};
