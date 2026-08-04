import { useForgotPassword } from "@/api/auth/auth.query";
import SmartLink from "@/components/shared/SmartLink";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api-errors";
import { cn } from "@/lib/utils";
import {
  forgotPasswordSchema,
  isForgotPasswordFormField,
  type ForgotPasswordFormData,
} from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { AlertCircleIcon, ChevronLeftIcon, MailCheckIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

function ForgotPassword() {
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const forgotPasswordMutation = useForgotPassword();
  const isSubmitting = forgotPasswordMutation.isPending;

  const {
    handleSubmit,
    setError,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
      turnstileToken: "",
    },
    resolver: zodResolver(forgotPasswordSchema),
    disabled: isSubmitting,
  });

  const turnstileTokenValue = watch("turnstileToken");
  const email = watch("email");

  const handleSubmitForm = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data, {
      onError: (error) => {
        turnstileRef.current?.reset();

        if (error instanceof ApiError && error.data?.errors) {
          for (const issue of error.data.errors) {
            if (isForgotPasswordFormField(issue.path)) {
              setError(issue.path, {
                type: "server",
                message: issue.message,
              });
            } else {
              setError("root.serverError", {
                type: "server",
                message: issue.message,
              });
            }
          }

          return;
        }

        setError("root.serverError", {
          type: "server",
          message: error.message,
        });
      },
    });
  };

  if (forgotPasswordMutation.isSuccess) {
    return (
      <>
        <div className="flex justify-center">
          <MailCheckIcon className="size-12 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Check your email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            If an account exists with{" "}
            <span className="font-medium text-foreground">{email}</span>, we've
            sent a link to reset your password. If you don't see it within a few
            minutes, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => forgotPasswordMutation.reset()}
          >
            Try a different email
          </Button>
          <SmartLink
            to={"/login"}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "w-full"
            )}
          >
            <ChevronLeftIcon /> Return to sign in
          </SmartLink>
        </CardFooter>
      </>
    );
  }

  return (
    <>
      <CardHeader className="text-center">
        <Field>
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </Field>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleSubmitForm)} noValidate>
          <FieldSet>
            <FieldGroup>
              {errors.root?.serverError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>Unable to send reset link</AlertTitle>
                  <AlertDescription>
                    {errors.root.serverError.message}
                  </AlertDescription>
                </Alert>
              )}

              <Field>
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Email address
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="example@gmail.com"
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </Field>

              {/* Cloudflare Turnstile */}
              <Field className={turnstileLoaded ? "" : "hidden!"}>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  options={{ size: "flexible" }}
                  onSuccess={(token) =>
                    setValue("turnstileToken", token, {
                      shouldValidate: true,
                    })
                  }
                  onExpire={() => setValue("turnstileToken", "")}
                  onWidgetLoad={() => setTurnstileLoaded(true)}
                  onError={() => {
                    setValue("turnstileToken", "");
                    setError("turnstileToken", {
                      message:
                        "Security verification failed. Please try again.",
                    });
                  }}
                />
                {errors.turnstileToken && (
                  <FieldError errors={[errors.turnstileToken]} />
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting || !turnstileTokenValue}
                  size={"lg"}
                >
                  {isSubmitting ? <Spinner /> : "Send Reset Link"}
                </Button>
                <SmartLink
                  to={"/login"}
                  className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "w-full"
                  )}
                >
                  <ChevronLeftIcon /> Return to sign in
                </SmartLink>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>
    </>
  );
}

export default ForgotPassword;
