import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { Toaster } from "sonner";

import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { appRoutes } from "@/routes";
import { setNavigator } from "@/utils/navigationHelper";

/** DEV-only: visit any route with `?crash=1` to verify the error boundary UI. */
function DevCrashProbe() {
  const { search } = useLocation();
  if (import.meta.env.DEV && new URLSearchParams(search).get("crash") === "1") {
    throw new Error("ErrorBoundary probe: intentional crash");
  }
  return null;
}

export default function App() {
  const navigate = useNavigate();
  const element = useRoutes(appRoutes);

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ScrollToTop />
          <DevCrashProbe />
          {element}
          <ReactQueryDevtools initialIsOpen={false} />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
