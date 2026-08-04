import {
  ActivityIcon,
  AudioWaveform,
  ClockIcon,
  CloudIcon,
  Command,
  GalleryVerticalEnd,
  HomeIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  UsersRoundIcon,
} from "lucide-react";
import * as React from "react";

import GoogleIcon from "@/assets/google-icon.svg";
import { DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { FolderColor } from "@/constants/folder";
import { cn } from "@/lib/utils";
import { FileUpIcon, FolderPlusIcon, FolderUpIcon } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router";
import CreateNewFolderDialog from "../shared/CreateNewFolderDialog";
import SmartLink from "../shared/SmartLink";
import { buttonVariants } from "./button";
import { Card, CardContent } from "./card";
import { Collapsible } from "./collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Field } from "./field";
import { Progress, ProgressLabel } from "./progress";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/home",
      icon: HomeIcon,
    },
    {
      title: "Shared with me",
      url: "/shared-with-me",
      icon: UsersRoundIcon,
    },
    {
      title: "Recent",
      url: "/recent",
      icon: ClockIcon,
    },
    {
      title: "Starred",
      url: "/starred",
      icon: StarIcon,
    },
    {
      title: "Trash",
      url: "/trash",
      icon: TrashIcon,
    },
  ],
  projects: [
    {
      name: "Storage",
      url: "/storage",
      icon: CloudIcon,
    },
    {
      name: "Activity",
      url: "/activity",
      icon: ActivityIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [folderColor, setFolderColor] = useState<FolderColor>("#FFCE3C");
  const location = useLocation();

  return (
    <>
      <CreateNewFolderDialog
        folderColor={folderColor}
        setFolderColor={setFolderColor}
        open={newFolderOpen}
        setOpen={setNewFolderOpen}
      />
      <Sidebar
        collapsible="icon"
        {...props}
        variant="floating"
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton
                        className={cn(
                          buttonVariants({ variant: "default" }),
                          "justify-start hover:text-primary-foreground"
                        )}
                        tooltip={"Create or upload"}
                      >
                        <PlusIcon /> Create or upload
                      </SidebarMenuButton>
                    }
                  />
                  <DropdownMenuContent side={"right"} className={"min-w-60"}>
                    <DropdownMenuItem
                      onClick={() => {
                        setNewFolderOpen(true);
                      }}
                    >
                      <FolderPlusIcon />
                      New Folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <FileUpIcon />
                        Files Upload
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FolderUpIcon />
                        Folder Upload
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <img src={GoogleIcon} className="size-4" /> Import from
                      Google Drive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const isActive = location.pathname === item.url;

                return (
                  <Collapsible
                    key={item.title}
                    render={
                      <SidebarMenuItem className="relative">
                        {isActive && (
                          <span
                            aria-hidden
                            className="absolute top-1/2 -left-2 h-5.5 w-1 -translate-y-1/2 rounded-t-full rounded-b-full bg-primary"
                          />
                        )}
                        <SidebarMenuButton
                          isActive={isActive}
                          render={<SmartLink to={item.url} />}
                          tooltip={item.title}
                        >
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    }
                    // defaultOpen={item.isActive}
                    className="group/collapsible"
                  />
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              {data.projects.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    render={
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.name}</span>
                      </a>
                    }
                    tooltip={item.name}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuItem>
              <Card size="sm" className="rounded-md text-nowrap">
                <CardContent>
                  <Field>
                    <Progress value={85.7} className={"flex-wrap-reverse"}>
                      {/* <ProgressValue /> */}
                      <ProgressLabel
                        className={"text-xs font-normal text-muted-foreground"}
                      >
                        12.86 GB of 15 GB used
                      </ProgressLabel>
                    </Progress>

                    <SidebarMenuButton
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "border-primary text-primary-text hover:text-primary-text active:text-primary-text dark:border-primary"
                      )}
                    >
                      Get more storage
                    </SidebarMenuButton>
                  </Field>
                </CardContent>
              </Card>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
