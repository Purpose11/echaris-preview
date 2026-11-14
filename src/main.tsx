import "./index.css";
import "./styles/shadcn.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "@/App";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary name="root">
      <BrowserRouter>
        <ErrorBoundary name="app">
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
