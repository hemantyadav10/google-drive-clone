import { Card } from "@/components/ui/card";
import { Outlet } from "react-router";
import authImage from "../assets/auth.webp";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen justify-center overflow-hidden bg-muted/50 sm:flex sm:items-center sm:py-8 dark:bg-background">
      <div
        className="fixed inset-0 bg-cover bg-position-[center_top] bg-no-repeat opacity-100 mix-blend-multiply dark:opacity-60 dark:mix-blend-normal dark:filter-[invert(1)_brightness(1.5)]"
        style={{ backgroundImage: `url(${authImage})` }}
      />

      <div className="relative w-full sm:max-w-sm">
        <Card className="min-h-screen rounded-none py-8 ring-0 sm:min-h-auto sm:rounded-xl sm:py-(--card-spacing) sm:shadow-lg">
          <Outlet />
        </Card>
      </div>
    </div>
  );
}
