import { useLogout } from "@/api/auth/auth.query";
import { currentUserQuery } from "@/api/user/user.query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  CloudIcon,
  HardDriveIcon,
  HelpCircleIcon,
  LogOutIcon,
  PaletteIcon,
  SettingsIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import UserAvatar from "../ui/user-avatar";
import SmartLink from "./SmartLink";

function ProfileMenu() {
  const { data } = useSuspenseQuery(currentUserQuery);
  const { setTheme, theme } = useTheme();

  const logoutMutation = useLogout();
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={logoutMutation.isPending}
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <UserAvatar
              name={data.fullName}
              seed={data.id}
              src={data.profilePicture}
              size="sm"
            />
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className={
          "min-w-60 before:backdrop-blur-2xl before:backdrop-saturate-150"
        }
      >
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="space-y-1">
            <p className="text-sm">{data?.fullName}</p>
            <p title={data?.email} className="text-xs text-foreground/80">
              {data?.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<SmartLink to={"/home"} />}>
            <HardDriveIcon />
            My Drive
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CloudIcon />
            Storage
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PaletteIcon />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className={"min-w-40"}>
                <DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={setTheme}
                  >
                    <DropdownMenuRadioItem value="light">
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem render={<SmartLink to={"/settings"} />}>
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircleIcon />
            Help
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileMenu;
