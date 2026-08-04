import SettingsLayout from "@/layouts/SettingsLayout";
import { createBrowserRouter } from "react-router";
import HydrateFallback from "../components/shared/HydrateFallback";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import RootLayout from "../layouts/RootLayout";
import { queryClient } from "../lib/query-client";
import Landing from "../pages/marketing/Landing";
import { currentUserLoader } from "./loaders/current-user.loader";
import { loggingMiddleware } from "./middleware/logging.middleware";
import { requireAuth } from "./middleware/require-auth.middelware";
import { requireGuest } from "./middleware/require-guest.middleware";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    middleware: [loggingMiddleware],
    children: [
      { path: "/", Component: Landing, loader: currentUserLoader(queryClient) },
      {
        Component: AuthLayout,
        middleware: [requireGuest(queryClient)],
        HydrateFallback: HydrateFallback,
        children: [
          {
            path: "/login",
            lazy: {
              Component: async () => {
                return (await import("../pages/auth/Login")).default;
              },
              action: async () => {
                return (await import("../router/actions/login.action"))
                  .loginAction;
              },
            },
          },
          {
            path: "/register",
            lazy: {
              Component: async () => {
                return (await import("../pages/auth/Register")).default;
              },
              action: async () => {
                return (await import("../router/actions/register.action"))
                  .registerAction;
              },
            },
          },
          {
            path: "/verify-email",
            lazy: {
              Component: async () => {
                return (await import("../pages/auth/VerifyEmail")).default;
              },
            },
          },
          {
            path: "/verify-email-pending",
            lazy: {
              Component: async () => {
                return (await import("../pages/auth/VerifyEmailPending"))
                  .default;
              },
              loader: async () => {
                return (
                  await import("../router/loaders/verify-email-pending.loader")
                ).verifyEmailPendingLoader;
              },
            },
          },
          {
            path: "forgot-password",
            lazy: {
              Component: async () => {
                return (await import("../pages/auth/ForgotPassword")).default;
              },
            },
          },
          {
            path: "reset-password",
            lazy: {
              Component: async () => {
                return (await import("../pages/auth/ResetPassword")).default;
              },
            },
          },
        ],
      },

      {
        Component: AppLayout,
        middleware: [requireAuth(queryClient)],
        HydrateFallback: HydrateFallback,
        children: [
          {
            path: "/home",
            lazy: {
              Component: async () => {
                return (await import("../pages/drive/Drive")).default;
              },
            },
          },
          {
            Component: SettingsLayout,
            path: "/settings",
            children: [
              {
                index: true,
                lazy: {
                  Component: async () => {
                    return (
                      await import("../pages/drive/settings/GeneralSettings")
                    ).default;
                  },
                },
              },
              {
                path: "security",
                lazy: {
                  Component: async () => {
                    return (
                      await import("../pages/drive/settings/SecuritySettings")
                    ).default;
                  },
                  loader: async () => {
                    return (
                      await import("./loaders/security-settings.loader")
                    ).securitySettingsLoader(queryClient);
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
]);
