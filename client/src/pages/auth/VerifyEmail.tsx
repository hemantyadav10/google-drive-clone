import { useVerifyEmail } from "@/api/auth/auth.query";
import SmartLink from "@/components/shared/SmartLink";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  LinkIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

const REDIRECT_DELAY_SECONDS = 3;

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const verifyEmailMutation = useVerifyEmail();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);

  const handleVerify = () => {
    if (!token) return;
    verifyEmailMutation.mutate(token);
  };

  useEffect(() => {
    if (!verifyEmailMutation.isSuccess) return;

    if (countdown <= 0) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [verifyEmailMutation.isSuccess, countdown, navigate]);

  // State: no token in URL
  if (!token) {
    return (
      <>
        <div className="flex justify-center">
          <LinkIcon className="size-12 text-muted-foreground" />
        </div>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            No verification link found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Open this page from the link in your email, or log in to resend it.
          </p>
        </CardContent>
        <CardFooter>
          <Field>
            <SmartLink
              to={"/login"}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Go to sign in
            </SmartLink>
          </Field>
        </CardFooter>
      </>
    );
  }

  // State: verified successfully — auto-redirects after a short countdown
  if (verifyEmailMutation.isSuccess) {
    return (
      <>
        <div className="flex justify-center">
          <CheckCircleIcon className="size-12 text-green-700 dark:text-green-500" />
        </div>
        <CardHeader>
          <CardTitle className="text-center text-xl">Email verified</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Your account is active. Redirecting to sign in in{" "}
            <span className="tabular-nums">{countdown}…</span>
          </p>
        </CardContent>
        <CardFooter>
          <SmartLink
            to={"/login"}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "w-full"
            )}
          >
            Continue to sign in now
          </SmartLink>
        </CardFooter>
      </>
    );
  }

  // State: verification failed (invalid or expired token)
  if (verifyEmailMutation.isError) {
    const message =
      verifyEmailMutation.error.message ??
      "This verification link no longer works.";

    return (
      <>
        <div className="flex justify-center">
          <AlertTriangleIcon className="size-12 text-destructive" />
        </div>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Link invalid or expired
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">{message}</p>
        </CardContent>
        <CardFooter>
          <Field>
            <SmartLink
              to={"/login"}
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Go to sign in
            </SmartLink>
          </Field>
        </CardFooter>
      </>
    );
  }

  // State: token present, awaiting click
  return (
    <>
      <div className="flex justify-center">
        <ShieldCheckIcon className="size-12 text-primary" />
      </div>
      <CardHeader>
        <CardTitle className="text-center text-xl">Verify your email</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          Click below to confirm your email address and activate your account.
        </p>
      </CardContent>
      <CardFooter>
        <Field>
          <Button
            size={"lg"}
            onClick={handleVerify}
            disabled={verifyEmailMutation.isPending}
          >
            {verifyEmailMutation.isPending ? <Spinner /> : "Verify email"}
          </Button>
        </Field>
      </CardFooter>
    </>
  );
}

export default VerifyEmail;
