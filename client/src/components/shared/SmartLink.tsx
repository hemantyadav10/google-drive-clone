import { useCallback, useEffect, useRef } from "react";
import { NavLink, type NavLinkProps } from "react-router";

export type PreloadStrategy =
  "viewport" | "hover" | "focus" | "hover-focus" | "immediate";

export interface SmartLinkProps extends Omit<NavLinkProps, "prefetch"> {
  moduleLoader?: () => Promise<unknown>;
  preloadStrategy?: PreloadStrategy;
}

function schedule(task: () => void) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(task, { timeout: 1000 });
  } else {
    setTimeout(task, 0);
  }
}

export default function SmartLink({
  moduleLoader,
  preloadStrategy = "viewport",
  onMouseEnter,
  onFocus,
  onTouchStart,
  to,
  viewTransition = false,
  ...props
}: SmartLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const didPreload = useRef(false);

  const runPreload = useCallback(() => {
    if (!moduleLoader || didPreload.current) return;

    didPreload.current = true;

    schedule(() => {
      void moduleLoader();
    });
  }, [moduleLoader]);

  useEffect(() => {
    didPreload.current = false;
  }, [to]);

  useEffect(() => {
    if (preloadStrategy !== "viewport") return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        runPreload();
        observer.disconnect();
      },
      {
        rootMargin: "200px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [preloadStrategy, runPreload]);

  useEffect(() => {
    if (preloadStrategy === "immediate") {
      runPreload();
    }
  }, [preloadStrategy, runPreload]);

  return (
    <NavLink
      ref={ref}
      to={to}
      viewTransition={viewTransition}
      {...props}
      onMouseEnter={(event) => {
        if (preloadStrategy === "hover" || preloadStrategy === "hover-focus") {
          runPreload();
        }

        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        if (preloadStrategy === "focus" || preloadStrategy === "hover-focus") {
          runPreload();
        }

        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        if (preloadStrategy === "hover" || preloadStrategy === "hover-focus") {
          runPreload();
        }

        onTouchStart?.(event);
      }}
    />
  );
}
