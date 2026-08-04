import { currentUserQuery } from "@/api/user/user.query";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CloudIcon, GemIcon, Menu, SearchIcon } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import ProfileMenu from "./ProfileMenu";
import SmartLink from "./SmartLink";

function AppHeader() {
  const { data } = useQuery(currentUserQuery);
  const { toggleSidebar, state } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="grid h-(--header-height) grid-cols-3 items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            aria-label={
              state === "expanded" ? "Collapse sidebar" : "Expand sidebar"
            }
            title={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="size-5" />
          </Button>
          <SmartLink
            to="/"
            className="col-span-1 flex items-center gap-2 justify-self-start"
          >
            <CloudIcon className="size-6 fill-primary-text text-primary-text" />
            <span className="text-xl font-medium">DriveClone</span>
          </SmartLink>
        </div>
        <InputGroup className="col-span-1 max-w-lg justify-self-center rounded-full bg-background not-focus-within:hover:shadow-md">
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <div className="col-span-1 flex items-center gap-4 justify-self-end">
          <Button
            variant={"outline"}
            className={
              "border-primary text-primary-text hover:text-primary-text dark:border-primary"
            }
          >
            <GemIcon />
            Upgrade
          </Button>
          {!data ? (
            <>
              <Skeleton className="size-8 rounded-full" />
            </>
          ) : (
            <ProfileMenu />
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
