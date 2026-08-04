import AppHeader from "@/components/shared/AppHeader";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";

function AppLayout() {
  const location = useLocation();
  const scrollRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="dark:background-card flex h-screen flex-col overflow-hidden bg-muted/50">
      <AppHeader />
      <section className="flex flex-1">
        <AppSidebar />
        <section
          ref={scrollRef}
          className="h-[calc(100vh-64px)] flex-1 overflow-y-auto bg-background md:rounded-tl-3xl md:border-t-2 md:border-l-2"
        >
          <Outlet />
        </section>
      </section>
    </div>
  );
}

export default AppLayout;
