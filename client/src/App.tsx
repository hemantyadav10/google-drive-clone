import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { RouterProvider } from "react-router";
import { queryClient } from "./lib/query-client";
import { router } from "./router";

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then(
    (d) => ({
      default: d.ReactQueryDevtools,
    })
  )
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <React.Suspense fallback={null}>
        <ReactQueryDevtoolsProduction />
      </React.Suspense>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
