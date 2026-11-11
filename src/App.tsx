import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { Toaster } from "sonner";

import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { appRoutes } from "@/routes";
import { setNavigator } from "@/utils/navigationHelper";

export default function App() {
  const navigate = useNavigate();
  const element = useRoutes(appRoutes);

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ScrollToTop />
          {element}
          <ReactQueryDevtools initialIsOpen={false} />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
