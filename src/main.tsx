import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Patch ResizeObserver to safely wrap its callbacks inside requestAnimationFrame
// This prevents "ResizeObserver loop limit exceeded" and "undelivered notifications" errors.
const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class SafeResizeObserver extends OriginalResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    super((entries, observer) => {
      window.requestAnimationFrame(() => {
        try {
          callback(entries, observer);
        } catch (e) {
          // Suppress isolated callback errors
        }
      });
    });
  }
};

window.addEventListener("error", (e) => {
  if (e.message && e.message.includes("ResizeObserver")) {
    e.stopImmediatePropagation();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
