import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Patch ResizeObserver to safely wrap its callbacks inside requestAnimationFrame
// This prevents the "ResizeObserver loop limit exceeded" and "undelivered notifications" errors.
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
  if (e.message.includes("ResizeObserver")) {
    e.stopImmediatePropagation();
    return;
  }
  document.body.innerHTML += `<div style="background:red;color:white;padding:20px;z-index:9999;position:fixed;top:0;left:0;width:100%;height:100vh;">
    <h1>Fatal Error</h1>
    <pre>${e.error?.stack || e.message || 'Unknown Error'}</pre>
  </div>`;
});

createRoot(document.getElementById("root")!).render(<App />);
