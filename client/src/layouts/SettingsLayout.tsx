import SmartLink from "@/components/shared/SmartLink";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useLocation } from "react-router";

function SettingsLayout() {
  const location = useLocation();

  const currentTab = location.pathname.startsWith("/settings/security")
    ? "password"
    : "account";

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 md:px-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Tabs
        value={currentTab}
        className="sticky top-0 z-10 w-full gap-0 bg-background"
      >
        <TabsList variant={"line"}>
          <TabsTrigger
            nativeButton={false}
            value="account"
            render={<SmartLink to={"/settings"} />}
          >
            General
          </TabsTrigger>
          <TabsTrigger
            nativeButton={false}
            value="password"
            render={<SmartLink to={"/settings/security"} />}
          >
            Security
          </TabsTrigger>
        </TabsList>
        <Separator />
      </Tabs>
      <Outlet />
    </section>
  );
}

export default SettingsLayout;
