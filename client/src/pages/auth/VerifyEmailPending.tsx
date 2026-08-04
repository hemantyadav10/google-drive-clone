import { useResendVerificationEmail } from "@/api/auth/auth.query";
import SmartLink from "@/components/shared/SmartLink";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  MailCheckIcon,
  MailIcon,
  MailWarningIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { toast } from "sonner";
import type { VerifyEmailContext } from "../../lib/verify-email-context";

const DEFAULT_COOLDOWN_SECONDS = 60;

function VerifyEmailPending() {
  const data = useLoaderData<VerifyEmailContext | null>();
  const resendEmailMutation = useResendVerificationEmail();

  const email = data?.email;
  const source = data?.source;

  const [cooldown, setCooldown] = useState(() =>
    source === "register" ? DEFAULT_COOLDOWN_SECONDS : 0
  );

  const isSubmitting = resendEmailMutation.isPending;
  const isOnCooldown = cooldown > 0;

  const heading =
    source === "login" ? "Email verification required" : "Verify your email";

  const bodyText =
    source === "login"
      ? "We haven't confirmed your email yet for"
      : "We've sent a verification link to";

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResendEmail = () => {
    if (!email || isOnCooldown) return;

    resendEmailMutation.mutate(email, {
      onSuccess: () => {
        setCooldown(DEFAULT_COOLDOWN_SECONDS);
        toast.success("Verification email sent.");
      },
      onError: (error) => {
        setCooldown(DEFAULT_COOLDOWN_SECONDS);
        toast.error(error.message);
      },
    });
  };

  const resendButtonLabel = isSubmitting ? (
    <Spinner />
  ) : isOnCooldown ? (
    `Resend in ${cooldown}s`
  ) : (
    "Resend email"
  );

  const Icon = !email
    ? MailIcon
    : source === "login"
      ? MailWarningIcon
      : MailCheckIcon;

  return (
    <>
      <div className="flex justify-center">
        <Icon className="size-12 text-primary" />
      </div>
      <CardHeader>
        <CardTitle className="text-center text-xl">{heading}</CardTitle>
      </CardHeader>
      <CardContent>
        {email ? (
          <div className="space-y-3 text-center">
            <p className="text-muted-foreground">
              {bodyText} <span className="text-foreground">{email}</span>
            </p>
            {source === "login" ? (
              <p className="text-muted-foreground">
                Use the link from your original verification email, or request a
                new one below.
              </p>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Click the link in that email to activate your account.
                </p>
                <p className="text-muted-foreground">
                  If you don't see it within a few minutes, check your Spam or
                  Junk folder.
                </p>
              </>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Log in with your email and password, and we'll help you verify your
            account from there.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {email ? (
          <>
            <Button
              size="lg"
              className="w-full tabular-nums"
              variant="default"
              disabled={isSubmitting || isOnCooldown}
              onClick={handleResendEmail}
            >
              {resendButtonLabel}
            </Button>
            <SmartLink
              to={"/login"}
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "w-full"
              )}
            >
              <ArrowLeftIcon />{" "}
              {source === "login" ? "Back to sign in" : "Go to sign in"}
            </SmartLink>
          </>
        ) : (
          <>
            <SmartLink
              to={"/login"}
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "w-full"
              )}
            >
              <ArrowLeftIcon /> Go to sign in
            </SmartLink>
          </>
        )}
      </CardFooter>
    </>
  );
}

export default VerifyEmailPending;
