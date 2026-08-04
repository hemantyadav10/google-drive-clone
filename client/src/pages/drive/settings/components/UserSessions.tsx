import {
  useLogoutAll,
  useRevokeSession,
  userSessionsQuery,
} from "@/api/auth/auth.query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { formatDeviceLabel } from "@/lib/utils";
import type { DeviceType } from "@/schemas/auth.schema";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  Gamepad2,
  HelpCircle,
  Laptop,
  Monitor,
  Smartphone,
  TriangleAlertIcon,
  Tv,
  Watch,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const deviceIcon: Record<DeviceType, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Laptop,
  console: Gamepad2,
  smarttv: Tv,
  wearable: Watch,
  unknown: HelpCircle,
};

function UserSessions() {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const { data: sessions } = useSuspenseQuery(userSessionsQuery);
  const revokeSessionMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAll();

  function handleRevoke(id: string) {
    revokeSessionMutation.mutate(id, {
      onSuccess: () => {
        setRevokingId(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  function handleRevokeAll() {
    logoutAllMutation.mutate(undefined, {
      onSuccess: () => {
        setRevokingAll(false);
      },
    });
  }

  return (
    <FieldSet>
      <Field orientation="responsive">
        <FieldContent>
          <FieldLegend>Active sessions</FieldLegend>
          <FieldDescription>
            This is a list of devices that have logged into your account. Revoke
            any sessions that you do not recognize.
          </FieldDescription>
        </FieldContent>
        <AlertDialog
          open={revokingAll}
          onOpenChange={(open) => {
            if (logoutAllMutation.isPending) return;
            setRevokingAll(open);
          }}
        >
          <AlertDialogTrigger
            render={
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive dark:text-destructive"
                disabled={logoutAllMutation.isPending}
              >
                Log out all sessions
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <TriangleAlertIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>Log out of all sessions?</AlertDialogTitle>
              <AlertDialogDescription>
                This signs you out on every device, including this one.
                You&apos;ll need to log in again to continue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-wrap">
              <AlertDialogCancel disabled={logoutAllMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRevokeAll}
                variant="destructive"
                disabled={logoutAllMutation.isPending}
              >
                {logoutAllMutation.isPending ? (
                  <>
                    <Spinner />
                    Logging out...
                  </>
                ) : (
                  "Log out"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Field>

      <Card size="sm">
        <CardContent className="-m-(--card-spacing)">
          {sessions.map((session, i) => {
            const Icon = deviceIcon[session.deviceType ?? "unknown"];
            return (
              <div key={session.id}>
                <Field orientation="responsive" className="p-(--card-spacing)">
                  <Field orientation="horizontal">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                  </Field>

                  <FieldContent>
                    <FieldTitle className="flex flex-wrap items-center gap-1">
                      {formatDeviceLabel(session.browserName, session.osName)}
                      {session.isCurrent && (
                        <span className="text-xs font-medium text-green-700 dark:text-green-400">
                          • Current
                        </span>
                      )}
                    </FieldTitle>
                    <FieldDescription className="text-xs">
                      {/* Mumbai, India ·  */}
                      {session.ipAddress}
                    </FieldDescription>
                    <FieldDescription className="text-xs">
                      Signed in {format(session.createdAt, "PP")} · Active{" "}
                      {session.isCurrent
                        ? "now"
                        : formatDistanceToNow(session.lastActiveAt, {
                            addSuffix: true,
                          })}{" "}
                    </FieldDescription>
                  </FieldContent>

                  {!session.isCurrent && (
                    <AlertDialog
                      open={revokingId === session.id}
                      onOpenChange={(open) => {
                        if (revokeSessionMutation.isPending) return;
                        setRevokingId(open ? session.id : null);
                      }}
                    >
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive dark:text-destructive"
                            disabled={
                              revokeSessionMutation.isPending &&
                              revokeSessionMutation.variables === session.id
                            }
                          >
                            Revoke
                          </Button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Revoke this session?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {session.browserName} on {session.osName} will be
                            signed out immediately. You&apos;ll need to log in
                            again on that device.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            disabled={revokeSessionMutation.isPending}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevoke(session.id)}
                            variant="destructive"
                            disabled={revokeSessionMutation.isPending}
                          >
                            {revokeSessionMutation.isPending ? (
                              <>
                                <Spinner />
                                Revoking...
                              </>
                            ) : (
                              "Revoke session"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </Field>
                {i < sessions.length - 1 && <FieldSeparator />}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </FieldSet>
  );
}

export default UserSessions;
