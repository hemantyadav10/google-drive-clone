import TopLoadingBar from "@/components/shared/TopLoadingBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, ScrollRestoration } from "react-router";
import { Toaster } from "sonner";

export default function RootLayout() {
  return (
    <SidebarProvider>
      <main className="w-full">
        <TopLoadingBar />
        <ScrollRestoration />
        <Toaster richColors />
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
